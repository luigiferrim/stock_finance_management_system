import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { generateToken, hashToken } from "@/lib/auth/tokens"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { revokeInvite, rotateInviteToken } from "@/lib/organizations/invites-repository"
import { requireSameOrigin } from "@/lib/security/api"
import { resolvePublicBaseUrl } from "@/lib/security/request"
import { validatePositiveInteger } from "@/lib/security/validation"

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "member:invite")
    if (!context.ok) return context.response

    const inviteId = validatePositiveInteger(id, "Convite")
    if (!inviteId.valid) return NextResponse.json({ error: inviteId.error }, { status: 400 })

    const rawToken = generateToken()
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS)
    const rotated = await rotateInviteToken({
      organizationId: context.organization.id,
      inviteId: inviteId.value,
      tokenHash: hashToken(rawToken),
      expiresAt,
    })

    if (!rotated) return NextResponse.json({ error: "Convite pendente não encontrado" }, { status: 404 })

    const sql = getDb()
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${context.userId}, ${context.organization.id}, 'regenerate_invite',
        ${`Novo link gerado para o convite de ${rotated.email}`}, NOW())
    `

    const acceptUrl = `${resolvePublicBaseUrl(request.url)}/convite/aceitar?token=${rawToken}`

    return NextResponse.json({
      id: rotated.id,
      email: rotated.email,
      role: rotated.role,
      acceptUrl,
      expiresAt: rotated.expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Erro ao regenerar convite:", error)
    return NextResponse.json({ error: "Erro ao regenerar convite" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "member:invite")
    if (!context.ok) return context.response

    const inviteId = validatePositiveInteger(id, "Convite")
    if (!inviteId.valid) return NextResponse.json({ error: inviteId.error }, { status: 400 })

    await revokeInvite(context.organization.id, inviteId.value)

    const sql = getDb()
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${context.userId}, ${context.organization.id}, 'revoke_invite',
        ${`Convite #${inviteId.value} revogado`}, NOW())
    `

    return NextResponse.json({ message: "Convite revogado" })
  } catch (error) {
    console.error("Erro ao revogar convite:", error)
    return NextResponse.json({ error: "Erro ao revogar convite" }, { status: 500 })
  }
}
