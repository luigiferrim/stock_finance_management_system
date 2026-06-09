import { getDb } from "@/lib/db"

export type PermissionRequest = {
  id: number
  organizationId: number
  requesterUserId: number
  requesterName: string
  requesterEmail: string
  requesterCurrentRole: string
  requestedRole: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  reviewedByUserId: number | null
  reviewedByName: string | null
  reviewedAt: string | null
  createdAt: string
}

export async function createPermissionRequest(
  organizationId: number,
  requesterUserId: number,
  requestedRole: string,
  reason: string | null,
): Promise<PermissionRequest> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO permission_requests
      (organization_id, requester_user_id, requested_role, reason, status, created_at, updated_at)
    VALUES
      (${organizationId}, ${requesterUserId}, ${requestedRole}, ${reason}, 'pending', NOW(), NOW())
    RETURNING
      id, organization_id, requester_user_id, requested_role, reason, status,
      reviewed_by_user_id, reviewed_at, created_at
  `
  const row = rows[0]
  return {
    id: Number(row.id),
    organizationId: Number(row.organization_id),
    requesterUserId: Number(row.requester_user_id),
    requesterName: "",
    requesterEmail: "",
    requesterCurrentRole: "",
    requestedRole: row.requested_role,
    reason: row.reason ?? null,
    status: row.status as "pending",
    reviewedByUserId: null,
    reviewedByName: null,
    reviewedAt: null,
    createdAt: row.created_at,
  }
}

export async function listPendingRequests(organizationId: number): Promise<PermissionRequest[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT
      pr.id,
      pr.organization_id,
      pr.requester_user_id,
      pr.requested_role,
      pr.reason,
      pr.status,
      pr.reviewed_by_user_id,
      pr.reviewed_at,
      pr.created_at,
      requester.name AS requester_name,
      requester.email AS requester_email,
      om.role AS requester_current_role,
      reviewer.name AS reviewer_name
    FROM permission_requests pr
    INNER JOIN users requester ON requester.id = pr.requester_user_id
    INNER JOIN organization_members om
      ON om.organization_id = pr.organization_id
      AND om.user_id = pr.requester_user_id
      AND om.active = TRUE
    LEFT JOIN users reviewer ON reviewer.id = pr.reviewed_by_user_id
    WHERE pr.organization_id = ${organizationId}
      AND pr.status = 'pending'
    ORDER BY pr.created_at ASC
  `
  return rows.map(mapRow)
}

export async function listAllRequests(organizationId: number): Promise<PermissionRequest[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT
      pr.id,
      pr.organization_id,
      pr.requester_user_id,
      pr.requested_role,
      pr.reason,
      pr.status,
      pr.reviewed_by_user_id,
      pr.reviewed_at,
      pr.created_at,
      requester.name AS requester_name,
      requester.email AS requester_email,
      om.role AS requester_current_role,
      reviewer.name AS reviewer_name
    FROM permission_requests pr
    INNER JOIN users requester ON requester.id = pr.requester_user_id
    INNER JOIN organization_members om
      ON om.organization_id = pr.organization_id
      AND om.user_id = pr.requester_user_id
      AND om.active = TRUE
    LEFT JOIN users reviewer ON reviewer.id = pr.reviewed_by_user_id
    WHERE pr.organization_id = ${organizationId}
    ORDER BY pr.created_at DESC
    LIMIT 50
  `
  return rows.map(mapRow)
}

export async function getRequestById(
  organizationId: number,
  requestId: number,
): Promise<PermissionRequest | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT
      pr.id,
      pr.organization_id,
      pr.requester_user_id,
      pr.requested_role,
      pr.reason,
      pr.status,
      pr.reviewed_by_user_id,
      pr.reviewed_at,
      pr.created_at,
      requester.name AS requester_name,
      requester.email AS requester_email,
      om.role AS requester_current_role,
      reviewer.name AS reviewer_name
    FROM permission_requests pr
    INNER JOIN users requester ON requester.id = pr.requester_user_id
    INNER JOIN organization_members om
      ON om.organization_id = pr.organization_id
      AND om.user_id = pr.requester_user_id
      AND om.active = TRUE
    LEFT JOIN users reviewer ON reviewer.id = pr.reviewed_by_user_id
    WHERE pr.id = ${requestId}
      AND pr.organization_id = ${organizationId}
    LIMIT 1
  `
  return rows[0] ? mapRow(rows[0]) : null
}

export async function updateRequestStatus(
  organizationId: number,
  requestId: number,
  status: "approved" | "rejected",
  reviewerUserId: number,
) {
  const sql = getDb()
  await sql`
    UPDATE permission_requests
    SET status = ${status}, reviewed_by_user_id = ${reviewerUserId}, reviewed_at = NOW(), updated_at = NOW()
    WHERE id = ${requestId}
      AND organization_id = ${organizationId}
      AND status = 'pending'
  `
}

export async function findPendingRequestForUser(
  organizationId: number,
  userId: number,
): Promise<PermissionRequest | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT
      pr.id, pr.organization_id, pr.requester_user_id, pr.requested_role,
      pr.reason, pr.status, pr.reviewed_by_user_id, pr.reviewed_at, pr.created_at,
      u.name AS requester_name, u.email AS requester_email,
      om.role AS requester_current_role,
      NULL::text AS reviewer_name
    FROM permission_requests pr
    INNER JOIN users u ON u.id = pr.requester_user_id
    INNER JOIN organization_members om
      ON om.organization_id = pr.organization_id
      AND om.user_id = pr.requester_user_id
      AND om.active = TRUE
    WHERE pr.organization_id = ${organizationId}
      AND pr.requester_user_id = ${userId}
      AND pr.status = 'pending'
    LIMIT 1
  `
  return rows[0] ? mapRow(rows[0]) : null
}

function mapRow(row: Record<string, unknown>): PermissionRequest {
  return {
    id: Number(row.id),
    organizationId: Number(row.organization_id),
    requesterUserId: Number(row.requester_user_id),
    requesterName: row.requester_name as string,
    requesterEmail: row.requester_email as string,
    requesterCurrentRole: row.requester_current_role as string,
    requestedRole: row.requested_role as string,
    reason: (row.reason as string | null) ?? null,
    status: row.status as "pending" | "approved" | "rejected",
    reviewedByUserId: row.reviewed_by_user_id ? Number(row.reviewed_by_user_id) : null,
    reviewedByName: (row.reviewer_name as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}
