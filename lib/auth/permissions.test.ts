import { describe, expect, it } from "vitest"

import {
  ROLES,
  type Action,
  type Role,
  can,
  canAssignRole,
  canManageMember,
  isKnownRole,
  parseRole,
} from "@/lib/auth/permissions"

// Expected allowances transcribed directly from the issue's permission matrix.
const EXPECTED: Record<Role, Action[]> = {
  Owner: [
    "dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "lot:delete",
    "financials:view", "history:view-full", "history:view-domain",
    "org:view-settings", "org:edit", "org:delete",
    "member:invite", "member:list", "member:remove", "member:change-role",
  ],
  Admin: [
    "dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "lot:delete",
    "financials:view", "history:view-full", "history:view-domain",
    "org:view-settings", "org:edit",
    "member:invite", "member:list", "member:remove", "member:change-role",
  ],
  Stock: ["dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "history:view-domain"],
  Finance: ["dashboard:view", "stock:view", "financials:view", "history:view-domain"],
  Viewer: ["dashboard:view", "stock:view"],
}

const ALL_ACTIONS: Action[] = [
  "dashboard:view", "stock:view", "lot:create", "lot:edit", "lot:change-status", "lot:delete",
  "financials:view", "history:view-full", "history:view-domain",
  "org:view-settings", "org:edit", "org:delete",
  "member:invite", "member:list", "member:remove", "member:change-role",
]

describe("can() matrix", () => {
  for (const role of ROLES) {
    for (const action of ALL_ACTIONS) {
      const allowed = EXPECTED[role].includes(action)
      it(`${role} ${allowed ? "can" : "cannot"} ${action}`, () => {
        expect(can(role, action)).toBe(allowed)
      })
    }
  }

  it("denies unknown / null role", () => {
    expect(can(null, "stock:view")).toBe(false)
    expect(can("Nope" as Role, "stock:view")).toBe(false)
  })
})

describe("canManageMember()", () => {
  it("Owner manages any role", () => {
    for (const target of ROLES) expect(canManageMember("Owner", target)).toBe(true)
  })
  it("Admin manages everyone except Owner", () => {
    expect(canManageMember("Admin", "Owner")).toBe(false)
    expect(canManageMember("Admin", "Admin")).toBe(true)
    expect(canManageMember("Admin", "Stock")).toBe(true)
  })
  it("non-managers manage nobody", () => {
    expect(canManageMember("Stock", "Viewer")).toBe(false)
    expect(canManageMember("Finance", "Viewer")).toBe(false)
    expect(canManageMember("Viewer", "Viewer")).toBe(false)
  })
})

describe("canAssignRole()", () => {
  it("Owner may assign any role", () => {
    for (const r of ROLES) expect(canAssignRole("Owner", r)).toBe(true)
  })
  it("Admin may assign any role except Owner", () => {
    expect(canAssignRole("Admin", "Owner")).toBe(false)
    expect(canAssignRole("Admin", "Admin")).toBe(true)
    expect(canAssignRole("Admin", "Viewer")).toBe(true)
  })
  it("others assign nothing", () => {
    expect(canAssignRole("Stock", "Viewer")).toBe(false)
  })
})

describe("parseRole() / isKnownRole()", () => {
  it("accepts known roles", () => {
    expect(parseRole("Owner")).toBe("Owner")
    expect(isKnownRole("Finance")).toBe(true)
  })
  it("rejects unknown", () => {
    expect(parseRole("Member")).toBeNull()
    expect(parseRole(null)).toBeNull()
    expect(isKnownRole("Member")).toBe(false)
  })
})
