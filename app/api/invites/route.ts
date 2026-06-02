import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { ROLES, canAssignRole, parseRole } from "@/lib/auth/permissions"
import { generateToken, hashToken } from "@/lib/auth/tokens"
import { normalizeEmail, validateEmail } from "@/lib/auth/validation"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { createInvite, findPendingInviteByEmail, listPendingInvites } from "@/lib/organizations/invites-repository"
import { findActiveMembershipByEmail } from "@/lib/organizations/members-repository"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  const context = await requirePermission(session, "member:list")
  if (!context.ok) return context.response
  return NextResponse.json({ invites: await listPendingInvites(context.organization.id) })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "member:invite")
    if (!context.ok) return context.response

    const body = await parseJsonBody<{ email?: unknown; role?: unknown }>(request)
    if (!body.ok) return body.response

    const role = parseRole(body.data.role)
    if (!role || role === "Owner" || !canAssignRole(context.role, role)) {
      return NextResponse.json({ error: "Papel de convite inválido" }, { status: 400 })
    }
    void ROLES

    const email = typeof body.data.email === "string" ? normalizeEmail(body.data.email) : ""
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 })
    }

    if (await findActiveMembershipByEmail(context.organization.id, email)) {
      return NextResponse.json({ error: "Este e-mail já é membro da organização" }, { status: 409 })
    }
    if (await findPendingInviteByEmail(context.organization.id, email)) {
      return NextResponse.json({ error: "Já existe um convite pendente para este e-mail" }, { status: 409 })
    }

    const rawToken = generateToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS)

    const invite = await createInvite({
      organizationId: context.organization.id,
      email,
      role,
      tokenHash,
      invitedByUserId: context.userId,
      expiresAt,
    })

    const sql = getDb()
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${context.userId}, ${context.organization.id}, 'invite_member',
        ${`Convite enviado para ${email} como ${role}`}, NOW())
    `

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
    const acceptUrl = `${baseUrl}/convite/aceitar?token=${rawToken}`

    return NextResponse.json(
      { id: invite.id, email, role, acceptUrl, token: rawToken, expiresAt: expiresAt.toISOString() },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar convite:", error)
    return NextResponse.json({ error: "Erro ao criar convite" }, { status: 500 })
  }
}
