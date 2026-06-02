import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { findActiveOrganizationForUser } from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger, validateText } from "@/lib/security/validation"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const userId = validatePositiveInteger(session.user.id, "Usuário")
    if (!userId.valid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existingOrganization = await findActiveOrganizationForUser(userId.value)
    if (existingOrganization) {
      return NextResponse.json({
        organization: {
          id: existingOrganization.id.toString(),
          name: existingOrganization.name,
          role: existingOrganization.role,
        },
      })
    }

    const body = await parseJsonBody<Partial<Record<"name", unknown>>>(request)
    if (!body.ok) {
      return body.response
    }

    const organizationName = validateText(body.data.name, {
      field: "Nome da organização",
      maxLength: 100,
      required: true,
    })

    if (!organizationName.valid) {
      return NextResponse.json({ error: organizationName.error }, { status: 400 })
    }

    const sql = getDb()
    const organizations = await sql`
      INSERT INTO organizations (name, created_at, updated_at)
      VALUES (${organizationName.value}, NOW(), NOW())
      RETURNING id, name
    `

    const organization = organizations[0]

    await sql`
      INSERT INTO organization_members (organization_id, user_id, role, active, created_at, updated_at)
      VALUES (${organization.id}, ${userId.value}, 'Owner', TRUE, NOW(), NOW())
    `

    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (
        ${userId.value},
        ${organization.id},
        'create_organization',
        ${`Organização "${organization.name}" criada`},
        NOW()
      )
    `

    return NextResponse.json(
      {
        organization: {
          id: organization.id.toString(),
          name: organization.name,
          role: "Owner",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar organização:", error)
    return NextResponse.json({ error: "Erro ao criar organização" }, { status: 500 })
  }
}
