import { type NextRequest, NextResponse } from "next/server"

import { hashPassword } from "@/lib/auth/password"
import { findUserByEmail } from "@/lib/auth/user-repository"
import { normalizeEmail, validateEmail, validateName, validatePasswordPolicy } from "@/lib/auth/validation"
import { getDb } from "@/lib/db"
import {
  assertOrganizationSchemaReady,
  isOrganizationSchemaNotReadyError,
  organizationSchemaNotReadyResponse,
} from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { getClientIp } from "@/lib/security/request"
import { createRateLimiter } from "@/lib/security/rate-limit"
import { validateText } from "@/lib/security/validation"

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

    const parsedBody = await parseJsonBody<Partial<Record<"email" | "password" | "name" | "organizationName", unknown>>>(
      request,
    )
    if (!parsedBody.ok) {
      return parsedBody.response
    }

    const body = parsedBody.data
    const { email, password, name, organizationName } = body

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      typeof organizationName !== "string"
    ) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)
    const trimmedName = name.trim()
    const validatedOrganizationName = validateText(organizationName, {
      field: "Nome da organização",
      maxLength: 100,
      required: true,
    })

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    if (!validateName(trimmedName)) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }

    if (!validatedOrganizationName.valid || !validatedOrganizationName.value) {
      return NextResponse.json(
        { error: validatedOrganizationName.valid ? "Nome da organização é obrigatório" : validatedOrganizationName.error },
        { status: 400 },
      )
    }

    const newOrganizationName = validatedOrganizationName.value

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

    await assertOrganizationSchemaReady()

    const hashedPassword = await hashPassword(password)
    const sql = getDb()
    const createdUsers = await sql`
      WITH new_user AS (
        INSERT INTO users (email, password, name)
        VALUES (${normalizedEmail}, ${hashedPassword}, ${trimmedName})
        RETURNING id, email, name
      ),
      new_organization AS (
        INSERT INTO organizations (name, created_at, updated_at)
        VALUES (${newOrganizationName}, NOW(), NOW())
        RETURNING id, name
      ),
      new_member AS (
        INSERT INTO organization_members (organization_id, user_id, role, active, created_at, updated_at)
        SELECT new_organization.id, new_user.id, 'Owner', TRUE, NOW(), NOW()
        FROM new_organization, new_user
        RETURNING role
      ),
      new_log AS (
        INSERT INTO logs (user_id, organization_id, action, details, created_at)
        SELECT
          new_user.id,
          new_organization.id,
          'register',
          ${`Novo usuário ${normalizedEmail} registrado e associado como Owner`},
          NOW()
        FROM new_user, new_organization
        RETURNING id
      )
      SELECT
        new_user.id,
        new_user.email,
        new_user.name,
        new_organization.id AS organization_id,
        new_organization.name AS organization_name,
        new_member.role
      FROM new_user, new_organization, new_member, new_log
    `

    const user = createdUsers[0]

    return NextResponse.json(
      {
        message: "Usuário e organização criados com sucesso",
        userId: user.id,
        organizationId: user.organization_id,
      },
      { status: 201 },
    )
  } catch (error) {
    if (isOrganizationSchemaNotReadyError(error)) {
      return organizationSchemaNotReadyResponse()
    }

    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 })
  }
}
