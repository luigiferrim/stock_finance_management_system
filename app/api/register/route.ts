import { type NextRequest, NextResponse } from "next/server"

import { hashPassword } from "@/lib/auth/password"
import { createAuthLog, createUser, findUserByEmail } from "@/lib/auth/user-repository"
import { normalizeEmail, validateEmail, validateName, validatePasswordPolicy } from "@/lib/auth/validation"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { getClientIp } from "@/lib/security/request"
import { createRateLimiter } from "@/lib/security/rate-limit"

const registerRateLimiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
})

export async function POST(request: NextRequest) {
  try {
    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const parsedBody = await parseJsonBody<Partial<Record<"email" | "password" | "name", unknown>>>(request)
    if (!parsedBody.ok) {
      return parsedBody.response
    }

    const body = parsedBody.data
    const { email, password, name } = body

    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)
    const trimmedName = name.trim()

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    if (!validateName(trimmedName)) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }

    const passwordValidation = validatePasswordPolicy(password)

    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 })
    }

    const ip = getClientIp(request.headers)
    const rateLimitResult = registerRateLimiter.check(`register:${ip}:${normalizedEmail}`)

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)

      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        },
      )
    }

    const existingUser = await findUserByEmail(normalizedEmail)

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await createUser({
      email: normalizedEmail,
      passwordHash: hashedPassword,
      name: trimmedName,
    })

    await createAuthLog({
      userId: user.id,
      action: "register",
      details: `Novo usuário ${normalizedEmail} registrado`,
    })

    return NextResponse.json({ message: "Usuário criado com sucesso", userId: user.id }, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 })
  }
}
