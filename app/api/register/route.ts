import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { hashPassword } from "@/lib/password"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const sql = getDb()

    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const users = await sql`
      INSERT INTO users (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING id
    `

    const userId = users[0].id

    await sql`
      INSERT INTO logs (user_id, action, details, created_at)
      VALUES (${userId}, 'register', ${`Novo usuário ${email} registrado`}, NOW())
    `

    return NextResponse.json({ message: "Usuário criado com sucesso", userId }, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 })
  }
}
