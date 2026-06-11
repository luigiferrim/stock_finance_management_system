import type { Session } from "next-auth"
import { NextResponse } from "next/server"

import { type Action, type Role, can, parseRole } from "@/lib/auth/permissions"
import { getDb } from "@/lib/db"
import { validatePositiveInteger } from "@/lib/security/validation"

export const NO_ORGANIZATION_ERROR = "Organização ativa não encontrada"
export const ORGANIZATION_SCHEMA_NOT_READY_ERROR = "OrganizationSchemaNotReady"

const ORGANIZATION_SCHEMA_ERROR_MESSAGE =
  "Estrutura de organizações não encontrada. Rode scripts/008-create-organizations-scope.sql no banco de dados."

type DatabaseError = {
  code?: string
  message?: string
}

export class OrganizationSchemaNotReadyError extends Error {
  constructor() {
    super(ORGANIZATION_SCHEMA_ERROR_MESSAGE)
    this.name = ORGANIZATION_SCHEMA_NOT_READY_ERROR
  }
}

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

export function organizationSchemaNotReadyResponse() {
  return NextResponse.json({ error: ORGANIZATION_SCHEMA_ERROR_MESSAGE }, { status: 503 })
}

export function isOrganizationSchemaNotReadyError(error: unknown) {
  if (error instanceof OrganizationSchemaNotReadyError) {
    return true
  }

  const databaseError = error as DatabaseError
  const message = databaseError.message ?? ""

  return (
    databaseError.code === "42P01" ||
    databaseError.code === "42703" ||
    message.includes("organizations") ||
    message.includes("organization_members") ||
    message.includes("organization_id")
  )
}

export async function assertOrganizationSchemaReady() {
  const sql = getDb()
  const rows = (await sql`
    SELECT
      to_regclass('public.organizations') IS NOT NULL AS has_organizations,
      to_regclass('public.organization_members') IS NOT NULL AS has_organization_members,
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'lots'
          AND column_name = 'organization_id'
      ) AS has_lots_organization_id,
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'logs'
          AND column_name = 'organization_id'
      ) AS has_logs_organization_id
  `) as Array<{
    has_organizations: boolean
    has_organization_members: boolean
    has_lots_organization_id: boolean
    has_logs_organization_id: boolean
  }>

  const schema = rows[0]

  if (
    !schema?.has_organizations ||
    !schema.has_organization_members ||
    !schema.has_lots_organization_id ||
    !schema.has_logs_organization_id
  ) {
    throw new OrganizationSchemaNotReadyError()
  }
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

export type PermissionContext =
  | { ok: true; userId: number; organization: ActiveOrganization; role: Role }
  | { ok: false; response: NextResponse }

export function permissionDeniedResponse() {
  return NextResponse.json({ error: "Você não tem permissão para esta ação" }, { status: 403 })
}

// Accepts a single action or an array (array = "any of").
export async function requirePermission(
  session: Session | null,
  action: Action | Action[],
): Promise<PermissionContext> {
  const organizationContext = await requireActiveOrganization(session)
  if (!organizationContext.ok) {
    return organizationContext
  }

  const role = parseRole(organizationContext.organization.role)
  if (!role) {
    return { ok: false, response: permissionDeniedResponse() }
  }

  const actions = Array.isArray(action) ? action : [action]
  const allowed = actions.some((candidate) => can(role, candidate))
  if (!allowed) {
    return { ok: false, response: permissionDeniedResponse() }
  }

  return {
    ok: true,
    userId: organizationContext.userId,
    organization: organizationContext.organization,
    role,
  }
}
