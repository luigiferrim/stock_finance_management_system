import { type NextRequest, NextResponse } from "next/server"

import { createAuthLog, createUser, findUserByEmail } from "@/lib/auth/user-repository"
import { hashPassword } from "@/lib/auth/password"
import { getClientIp } from "@/lib/security/request"
import { createRateLimiter } from "@/lib/security/rate-limit"

const registerRateLimiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000,
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rateLimitResult = registerRateLimiter.check(`register:${ip}`)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Aguarde um pouco antes de tentar novamente." },
        { status: 429 },
      )
    }

    const body = await request.json()
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos os campos sao obrigatorios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter no minimo 6 caracteres" }, { status: 400 })
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const user = await createUser({
      email,
      name,
      passwordHash,
    })

    await createAuthLog({
      userId: Number(user.id),
      action: "register",
      details: `Novo usuario ${email} registrado`,
    })

    return NextResponse.json(
      {
        message: "Usuario criado com sucesso",
        userId: user.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao registrar usuario:", error)
    return NextResponse.json({ error: "Erro ao registrar usuario" }, { status: 500 })
  }
}
