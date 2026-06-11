import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { hashToken } from "@/lib/auth/tokens"
import { getDb } from "@/lib/db"
import { requireActiveOrganization } from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const orgContext = await requireActiveOrganization(session)
    if (!orgContext.ok) return orgContext.response

    const body = await parseJsonBody<{ token?: unknown }>(request)
    if (!body.ok) return body.response
    if (typeof body.data.token !== "string") return NextResponse.json({ error: "Token inválido" }, { status: 400 })

    const sql = getDb()
    const users = await sql`
      SELECT id, pending_email, email_change_token_hash, email_change_expires_at
      FROM users WHERE id = ${orgContext.userId} LIMIT 1
    `
    const user = users[0]
    if (!user || !user.pending_email || !user.email_change_token_hash) {
      return NextResponse.json({ error: "Nenhuma troca de e-mail pendente" }, { status: 404 })
    }
    if (hashToken(body.data.token) !== user.email_change_token_hash) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }
    if (new Date(user.email_change_expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Token expirado" }, { status: 410 })
    }

    const stillFree = await sql`SELECT id FROM users WHERE lower(email) = lower(${user.pending_email}) AND id <> ${user.id} LIMIT 1`
    if (stillFree.length > 0) {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 409 })
    }

    await sql`
      UPDATE users
      SET email = ${user.pending_email},
          email_verified_at = NOW(),
          pending_email = NULL,
          email_change_token_hash = NULL,
          email_change_expires_at = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${user.id}, ${orgContext.organization.id}, 'confirm_email_change',
        ${`E-mail confirmado e atualizado para ${user.pending_email}`}, NOW())
    `

    return NextResponse.json({ message: "E-mail atualizado", email: user.pending_email })
  } catch (error) {
    console.error("Erro ao confirmar e-mail:", error)
    return NextResponse.json({ error: "Erro ao confirmar e-mail" }, { status: 500 })
  }
}
