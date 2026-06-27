import { type NextRequest, NextResponse } from "next/server"

import { hashPassword } from "@/lib/auth/password"
import { hashToken } from "@/lib/auth/tokens"
import { createUser, findUserByEmail } from "@/lib/auth/user-repository"
import { normalizeEmail, validateEmail, validateName, validatePasswordPolicy } from "@/lib/auth/validation"
import { getDb } from "@/lib/db"
import {
  assertOrganizationSchemaReady,
  isOrganizationSchemaNotReadyError,
  organizationSchemaNotReadyResponse,
} from "@/lib/organizations/context"
import { findInviteByTokenHash, markInviteAccepted } from "@/lib/organizations/invites-repository"
import { upsertMembership } from "@/lib/organizations/members-repository"
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

    const parsedBody = await parseJsonBody<
      Partial<Record<"email" | "password" | "name" | "organizationName" | "inviteToken", unknown>>
    >(request)
    if (!parsedBody.ok) {
      return parsedBody.response
    }

    const body = parsedBody.data
    const { email, password, name } = body
    const inviteToken =
      typeof body.inviteToken === "string" && body.inviteToken.length >= 10 ? body.inviteToken : null

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

    await assertOrganizationSchemaReady()

    const existingUser = await findUserByEmail(normalizedEmail)

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Fluxo de convite: o usuário foi convidado para uma organização existente.
    // Em vez de criar uma organização própria, associamos a conta diretamente à
    // organização do convite, com o papel definido por quem convidou.
    if (inviteToken) {
      return await registerInvitedUser({
        inviteToken,
        email: normalizedEmail,
        name: trimmedName,
        password,
      })
    }

    return await registerWithNewOrganization({
      organizationName: body.organizationName,
      email: normalizedEmail,
      name: trimmedName,
      password,
    })
  } catch (error) {
    if (isOrganizationSchemaNotReadyError(error)) {
      return organizationSchemaNotReadyResponse()
    }

    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 })
  }
}

type RegisterParams = {
  email: string
  name: string
  password: string
}

async function registerInvitedUser({
  inviteToken,
  email,
  name,
  password,
}: RegisterParams & { inviteToken: string }) {
  const invite = await findInviteByTokenHash(hashToken(inviteToken))

  if (!invite || invite.status !== "pending") {
    return NextResponse.json({ error: "Convite inválido ou já utilizado" }, { status: 404 })
  }

  if (invite.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Este convite expirou" }, { status: 410 })
  }

  if (email !== normalizeEmail(invite.email)) {
    return NextResponse.json(
      { error: `Este convite foi enviado para ${invite.email}. Use esse e-mail para criar a conta.` },
      { status: 400 },
    )
  }

  const hashedPassword = await hashPassword(password)
  const user = await createUser({ email, name, passwordHash: hashedPassword })

  await upsertMembership(invite.organizationId, Number(user.id), invite.role)
  await markInviteAccepted(invite.id)

  const sql = getDb()
  await sql`
    INSERT INTO logs (user_id, organization_id, action, details, created_at)
    VALUES
      (${user.id}, ${invite.organizationId}, 'register',
        ${`Novo usuário ${email} registrado via convite`}, NOW()),
      (${user.id}, ${invite.organizationId}, 'accept_invite',
        ${`Usuário aceitou convite como ${invite.role} ao criar a conta`}, NOW())
  `

  return NextResponse.json(
    {
      message: "Conta criada e convite aceito com sucesso",
      userId: user.id,
      organizationId: invite.organizationId,
      role: invite.role,
      invited: true,
    },
    { status: 201 },
  )
}

async function registerWithNewOrganization({
  organizationName,
  email,
  name,
  password,
}: RegisterParams & { organizationName: unknown }) {
  const validatedOrganizationName = validateText(organizationName, {
    field: "Nome da organização",
    maxLength: 100,
    required: true,
  })

  if (!validatedOrganizationName.valid || !validatedOrganizationName.value) {
    return NextResponse.json(
      {
        error: validatedOrganizationName.valid
          ? "Nome da organização é obrigatório"
          : validatedOrganizationName.error,
      },
      { status: 400 },
    )
  }

  const newOrganizationName = validatedOrganizationName.value
  const hashedPassword = await hashPassword(password)
  const sql = getDb()
  const createdUsers = await sql`
    WITH new_user AS (
      INSERT INTO users (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
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
        ${`Novo usuário ${email} registrado e associado como Owner`},
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
}
