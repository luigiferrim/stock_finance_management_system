import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { validatePasswordPolicy } from "@/lib/auth/validation"
import { requireActiveOrganization } from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const organizationContext = await requireActiveOrganization(session)
    if (!organizationContext.ok) {
      return organizationContext.response
    }

    const body = await parseJsonBody(request)
    if (!body.ok) {
      return body.response
    }

    const { currentPassword, newPassword } = body.data

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const passwordValidation = validatePasswordPolicy(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    const sql = getDb()

    const users = await sql`
      SELECT id, password FROM users WHERE email = ${session.user.email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = users[0]

    const passwordVerification = await verifyPassword(currentPassword, user.password)

    if (!passwordVerification.valid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)

    await sql`
      UPDATE users SET password = ${hashedPassword} WHERE id = ${user.id}
    `

    await sql`
      INSERT INTO logs (user_id, organization_id, action, details)
      VALUES (${user.id}, ${organizationContext.organization.id}, 'change_password', 'Usuário alterou sua senha')
    `

    return NextResponse.json({ success: true, message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 })
  }
}
