import { getDb } from "@/lib/db"

export type OrganizationMember = {
  id: number
  userId: number
  name: string
  email: string
  role: string
  joinedAt: string
}

export async function listMembers(organizationId: number): Promise<OrganizationMember[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT
      organization_members.id,
      organization_members.user_id,
      organization_members.role,
      organization_members.created_at,
      users.name,
      users.email
    FROM organization_members
    INNER JOIN users ON users.id = organization_members.user_id
    WHERE organization_members.organization_id = ${organizationId}
      AND organization_members.active = TRUE
    ORDER BY organization_members.created_at ASC
  `
  return rows.map((row) => ({
    id: Number(row.id),
    userId: Number(row.user_id),
    name: row.name,
    email: row.email,
    role: row.role,
    joinedAt: row.created_at,
  }))
}

export async function getMembershipById(organizationId: number, memberId: number) {
  const sql = getDb()
  const rows = await sql`
    SELECT id, user_id, role, active
    FROM organization_members
    WHERE id = ${memberId} AND organization_id = ${organizationId}
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null
  return { id: Number(row.id), userId: Number(row.user_id), role: row.role as string, active: row.active as boolean }
}

export async function countActiveOwners(organizationId: number): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM organization_members
    WHERE organization_id = ${organizationId} AND role = 'Owner' AND active = TRUE
  `
  return Number(rows[0]?.count ?? 0)
}

export async function updateMemberRole(organizationId: number, memberId: number, role: string) {
  const sql = getDb()
  await sql`
    UPDATE organization_members
    SET role = ${role}, updated_at = NOW()
    WHERE id = ${memberId} AND organization_id = ${organizationId}
  `
}

export async function deactivateMember(organizationId: number, memberId: number) {
  const sql = getDb()
  await sql`
    UPDATE organization_members
    SET active = FALSE, updated_at = NOW()
    WHERE id = ${memberId} AND organization_id = ${organizationId}
  `
}

export async function upsertMembership(organizationId: number, userId: number, role: string) {
  const sql = getDb()
  await sql`
    INSERT INTO organization_members (organization_id, user_id, role, active, created_at, updated_at)
    VALUES (${organizationId}, ${userId}, ${role}, TRUE, NOW(), NOW())
    ON CONFLICT (organization_id, user_id)
    DO UPDATE SET role = EXCLUDED.role, active = TRUE, updated_at = NOW()
  `
}

export async function findActiveMembershipByEmail(organizationId: number, email: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT organization_members.id
    FROM organization_members
    INNER JOIN users ON users.id = organization_members.user_id
    WHERE organization_members.organization_id = ${organizationId}
      AND organization_members.active = TRUE
      AND lower(users.email) = lower(${email})
    LIMIT 1
  `
  return rows[0] ? { id: Number(rows[0].id) } : null
}
