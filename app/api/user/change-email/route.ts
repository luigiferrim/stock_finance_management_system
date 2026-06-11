import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { verifyPassword } from "@/lib/auth/password"
import { generateToken, hashToken } from "@/lib/auth/tokens"
import { normalizeEmail, validateEmail } from "@/lib/auth/validation"
import { getDb } from "@/lib/db"
import { requireActiveOrganization } from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"

const EMAIL_CHANGE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const originError = requireSameOrigin(request)
    if (originError) return originError

    // Any authenticated member may change their own email; still require an active org for consistency.
    const orgContext = await requireActiveOrganization(session)
    if (!orgContext.ok) return orgContext.response

    const body = await parseJsonBody<{ newEmail?: unknown; currentPassword?: unknown }>(request)
    if (!body.ok) return body.response

    const newEmail = typeof body.data.newEmail === "string" ? normalizeEmail(body.data.newEmail) : ""
    const currentPassword = body.data.currentPassword
    if (!validateEmail(newEmail) || typeof currentPassword !== "string") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const sql = getDb()
    const users = await sql`SELECT id, email, password FROM users WHERE id = ${orgContext.userId} LIMIT 1`
    const user = users[0]
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    if (newEmail === normalizeEmail(user.email)) {
      return NextResponse.json({ error: "Este já é o seu e-mail atual" }, { status: 400 })
    }

    const passwordCheck = await verifyPassword(currentPassword, user.password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    const taken = await sql`SELECT id FROM users WHERE lower(email) = lower(${newEmail}) AND id <> ${user.id} LIMIT 1`
    if (taken.length > 0) {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 409 })
    }

    const rawToken = generateToken()
    const expiresAt = new Date(Date.now() + EMAIL_CHANGE_TTL_MS)
    await sql`
      UPDATE users
      SET pending_email = ${newEmail},
          email_change_token_hash = ${hashToken(rawToken)},
          email_change_expires_at = ${expiresAt},
          updated_at = NOW()
      WHERE id = ${user.id}
    `
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${user.id}, ${orgContext.organization.id}, 'request_email_change',
        ${`Solicitou troca de e-mail para ${newEmail}`}, NOW())
    `

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
    const confirmUrl = `${baseUrl}/conta/confirmar-email?token=${rawToken}`

    return NextResponse.json({ message: "Confirmação gerada", confirmUrl, pendingEmail: newEmail })
  } catch (error) {
    console.error("Erro ao solicitar troca de e-mail:", error)
    return NextResponse.json({ error: "Erro ao solicitar troca de e-mail" }, { status: 500 })
  }
}
