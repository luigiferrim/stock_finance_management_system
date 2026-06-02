import type { Session } from "next-auth"
import { NextResponse } from "next/server"

import { getDb } from "@/lib/db"
import { validatePositiveInteger } from "@/lib/security/validation"

export const NO_ORGANIZATION_ERROR = "Organização ativa não encontrada"

export type OrganizationRole = "Owner" | "Admin" | "Member" | string

export type ActiveOrganization = {
  id: number
  name: string
  role: OrganizationRole
}

export type OrganizationContext =
  | { ok: true; userId: number; organization: ActiveOrganization }
  | { ok: false; response: NextResponse }

export function organizationRequiredResponse() {
  return NextResponse.json({ error: NO_ORGANIZATION_ERROR }, { status: 403 })
}

export async function findActiveOrganizationForUser(userId: number): Promise<ActiveOrganization | null> {
  const sql = getDb()
  const organizations = (await sql`
    SELECT
      organizations.id,
      organizations.name,
      organization_members.role
    FROM organization_members
    INNER JOIN organizations ON organizations.id = organization_members.organization_id
    WHERE organization_members.user_id = ${userId}
      AND organization_members.active = TRUE
    ORDER BY organization_members.id ASC
    LIMIT 1
  `) as Array<{ id: number; name: string; role: string }>

  const organization = organizations[0]

  if (!organization) {
    return null
  }

  return {
    id: Number(organization.id),
    name: organization.name,
    role: organization.role,
  }
}

export async function requireActiveOrganization(session: Session | null): Promise<OrganizationContext> {
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) }
  }

  const userId = validatePositiveInteger(session.user.id, "Usuário")
  if (!userId.valid) {
    return { ok: false, response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) }
  }

  const sessionOrganizationId = validatePositiveInteger(session.user.organizationId, "Organização")
  const organization = await findActiveOrganizationForUser(userId.value)

  if (!organization) {
    return { ok: false, response: organizationRequiredResponse() }
  }

  if (sessionOrganizationId.valid && organization.id !== sessionOrganizationId.value) {
    return { ok: false, response: organizationRequiredResponse() }
  }

  return { ok: true, userId: userId.value, organization }
}
