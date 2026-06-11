export const ROLES = ["Owner", "Admin", "Stock", "Finance", "Viewer"] as const
export type Role = (typeof ROLES)[number]

export type Action =
  | "dashboard:view"
  | "stock:view"
  | "lot:create"
  | "lot:edit"
  | "lot:change-status"
  | "lot:delete"
  | "financials:view"
  | "history:view-full"
  | "history:view-domain"
  | "org:view-settings"
  | "org:edit"
  | "org:delete"
  | "member:invite"
  | "member:list"
  | "member:remove"
  | "member:change-role"

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Action>> = {
  Owner: new Set<Action>([
    "dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "lot:delete",
    "financials:view", "history:view-full", "history:view-domain",
    "org:view-settings", "org:edit", "org:delete",
    "member:invite", "member:list", "member:remove", "member:change-role",
  ]),
  Admin: new Set<Action>([
    "dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "lot:delete",
    "financials:view", "history:view-full", "history:view-domain",
    "org:view-settings", "org:edit",
    "member:invite", "member:list", "member:remove", "member:change-role",
  ]),
  Stock: new Set<Action>([
    "dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "history:view-domain",
  ]),
  Finance: new Set<Action>([
    "dashboard:view", "stock:view", "financials:view", "history:view-domain",
  ]),
  Viewer: new Set<Action>(["dashboard:view", "stock:view"]),
}

export function isKnownRole(value: unknown): value is Role {
  return parseRole(value) !== null
}

export function parseRole(value: unknown): Role | null {
  if (typeof value !== "string") return null

  const normalizedRole = value.trim().toLowerCase()
  return ROLES.find((role) => role.toLowerCase() === normalizedRole) ?? null
}

export function can(role: Role | string | null | undefined, action: Action): boolean {
  const parsedRole = parseRole(role)
  if (!parsedRole) return false
  return ROLE_PERMISSIONS[parsedRole].has(action)
}

// Target-dependent rules (cannot live in the flat matrix).
export function canManageMember(actor: Role, target: Role): boolean {
  if (actor === "Owner") return true
  if (actor === "Admin") return target !== "Owner"
  return false
}

export function canAssignRole(actor: Role, newRole: Role): boolean {
  if (actor === "Owner") return true
  if (actor === "Admin") return newRole !== "Owner"
  return false
}

// --- Audit-log domain filtering for history:view-domain ---
export const STOCK_LOG_ACTIONS = ["create_lot", "update_lot", "change_status", "delete_lot"] as const

// Owner/Admin (history:view-full) -> null (no filter). Stock/Finance -> lot lifecycle actions.
export function logActionFilterForRole(role: Role): readonly string[] | null {
  if (can(role, "history:view-full")) return null
  if (can(role, "history:view-domain")) return STOCK_LOG_ACTIONS
  return [] // no history access
}
