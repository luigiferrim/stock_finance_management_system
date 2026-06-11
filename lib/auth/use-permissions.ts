"use client"

import { useSession } from "next-auth/react"

import { type Action, type Role, can, parseRole } from "@/lib/auth/permissions"

export function useRole(): Role | null {
  const { data: session } = useSession()
  return parseRole(session?.user?.role)
}

export function usePermission(action: Action): boolean {
  const role = useRole()
  return can(role, action)
}
