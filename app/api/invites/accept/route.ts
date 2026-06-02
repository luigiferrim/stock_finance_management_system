import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { hashToken } from "@/lib/auth/tokens"
import { normalizeEmail } from "@/lib/auth/validation"
import { getDb } from "@/lib/db"
import {
  findInviteByTokenHash,
  markInviteAccepted,
  markInviteExpired,
} from "@/lib/organizations/invites-repository"
import { upsertMembership } from "@/lib/organizations/members-repository"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const userId = validatePositiveInteger(session.user.id, "Usuário")
    if (!userId.valid) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await parseJsonBody<{ token?: unknown }>(request)
    if (!body.ok) return body.response
    if (typeof body.data.token !== "string" || body.data.token.length < 10) {
      return NextResponse.json({ error: "Convite inválido" }, { status: 400 })
    }

    const invite = await findInviteByTokenHash(hashToken(body.data.token))
    if (!invite || invite.status !== "pending") {
      return NextResponse.json({ error: "Convite inválido ou já utilizado" }, { status: 404 })
    }

    if (invite.expiresAt.getTime() <= Date.now()) {
      await markInviteExpired(invite.id)
      return NextResponse.json({ error: "Este convite expirou" }, { status: 410 })
    }

    if (normalizeEmail(session.user.email) !== normalizeEmail(invite.email)) {
      return NextResponse.json(
        { error: "Este convite foi enviado para outro e-mail. Entre com a conta convidada." },
        { status: 403 },
      )
    }

    await upsertMembership(invite.organizationId, userId.value, invite.role)
    await markInviteAccepted(invite.id)

    const sql = getDb()
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${userId.value}, ${invite.organizationId}, 'accept_invite',
        ${`Usuário aceitou convite como ${invite.role}`}, NOW())
    `

    return NextResponse.json({ message: "Convite aceito", organizationId: invite.organizationId, role: invite.role })
  } catch (error) {
    console.error("Erro ao aceitar convite:", error)
    return NextResponse.json({ error: "Erro ao aceitar convite" }, { status: 500 })
  }
}
