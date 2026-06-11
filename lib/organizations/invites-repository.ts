import { getDb } from "@/lib/db"

export type PendingInvite = {
  id: number
  email: string
  role: string
  expiresAt: string
  createdAt: string
}

export async function listPendingInvites(organizationId: number): Promise<PendingInvite[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, email, role, expires_at, created_at
    FROM organization_invites
    WHERE organization_id = ${organizationId} AND status = 'pending' AND expires_at > NOW()
    ORDER BY created_at DESC
  `
  return rows.map((row) => ({
    id: Number(row.id),
    email: row.email,
    role: row.role,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }))
}

export async function createInvite(params: {
  organizationId: number
  email: string
  role: string
  tokenHash: string
  invitedByUserId: number
  expiresAt: Date
}) {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO organization_invites
      (organization_id, email, role, token_hash, status, invited_by_user_id, expires_at, created_at, updated_at)
    VALUES
      (${params.organizationId}, ${params.email}, ${params.role}, ${params.tokenHash}, 'pending',
       ${params.invitedByUserId}, ${params.expiresAt}, NOW(), NOW())
    RETURNING id
  `
  return { id: Number(rows[0].id) }
}

export async function findInviteByTokenHash(tokenHash: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT id, organization_id, email, role, status, expires_at
    FROM organization_invites
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null
  return {
    id: Number(row.id),
    organizationId: Number(row.organization_id),
    email: row.email as string,
    role: row.role as string,
    status: row.status as string,
    expiresAt: new Date(row.expires_at),
  }
}

export async function markInviteAccepted(inviteId: number) {
  const sql = getDb()
  await sql`
    UPDATE organization_invites
    SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
    WHERE id = ${inviteId}
  `
}

export async function markInviteExpired(inviteId: number) {
  const sql = getDb()
  await sql`UPDATE organization_invites SET status = 'expired', updated_at = NOW() WHERE id = ${inviteId}`
}

export async function revokeInvite(organizationId: number, inviteId: number) {
  const sql = getDb()
  await sql`
    UPDATE organization_invites
    SET status = 'revoked', updated_at = NOW()
    WHERE id = ${inviteId} AND organization_id = ${organizationId} AND status = 'pending'
  `
}

export async function findPendingInviteByEmail(organizationId: number, email: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT id FROM organization_invites
    WHERE organization_id = ${organizationId}
      AND lower(email) = lower(${email})
      AND status = 'pending' AND expires_at > NOW()
    LIMIT 1
  `
  return rows[0] ? { id: Number(rows[0].id) } : null
}
