import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { validateName } from "@/lib/auth/validation"
import { getDb } from "@/lib/db"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const userId = validatePositiveInteger(session.user.id, "Usuário")
    if (!userId.valid) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const parsedBody = await parseJsonBody<Partial<Record<"name", unknown>>>(request)
    if (!parsedBody.ok) {
      return parsedBody.response
    }

    const { name } = parsedBody.data

    if (typeof name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const trimmedName = name.trim()

    if (!validateName(trimmedName)) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }

    const sql = getDb()
    const users = await sql`
      UPDATE users
      SET name = ${trimmedName}, updated_at = NOW()
      WHERE id = ${userId.value}
      RETURNING id, email, name
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = users[0]

    await sql`
      INSERT INTO logs (user_id, action, details, created_at)
      VALUES (${user.id}, 'change_name', 'Usuário alterou o próprio nome', NOW())
    `

    return NextResponse.json({
      message: "Nome atualizado com sucesso",
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
  }
}
