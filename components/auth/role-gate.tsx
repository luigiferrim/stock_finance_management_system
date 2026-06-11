"use client"

import type { ReactNode } from "react"

import type { Action } from "@/lib/auth/permissions"
import { usePermission } from "@/lib/auth/use-permissions"

export function RoleGate({
  action,
  children,
  fallback = null,
}: {
  action: Action
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = usePermission(action)
  return <>{allowed ? children : fallback}</>
}

export function PermissionDenied({
  message = "Você não tem permissão para acessar esta seção.",
}: {
  message?: string
}) {
  return (
    <div className="rounded-xl border border-[#e6e0d9] bg-[#faf8f5] p-8 text-center">
      <p className="text-sm font-medium text-[#6e5a4b]">{message}</p>
    </div>
  )
}
