"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES, type Role, can } from "@/lib/auth/permissions"
import { useRole } from "@/lib/auth/use-permissions"

interface PendingRequest {
  id: number
  requestedRole: string
  createdAt: string
}

interface MineResponse {
  pending: {
    id: number
    requestedRole: string
    createdAt: string
  } | null
  error?: string
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function RequestRoleCard() {
  const currentRole = useRole()

  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>("Admin")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadPending = useCallback(async () => {
    try {
      const response = await fetch("/api/permission-requests/mine", { cache: "no-store" })
      const data = (await response.json()) as MineResponse

      if (!response.ok) return

      setPendingRequest(data.pending ?? null)
    } catch {
      // silently fail — this section is non-critical
    }
  }, [])

  useEffect(() => {
    void loadPending()
  }, [loadPending])

  // Only show to roles that can't manage members (Stock, Finance, Viewer)
  if (!currentRole || can(currentRole, "org:view-settings")) {
    return null
  }

  const eligibleRoles = ROLES.filter((r) => {
    const currentIndex = ROLES.indexOf(currentRole as (typeof ROLES)[number])
    const targetIndex = ROLES.indexOf(r)
    return targetIndex > currentIndex
  })

  if (eligibleRoles.length === 0) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    try {
      setSubmitting(true)

      const response = await fetch("/api/permission-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedRole: selectedRole, reason: reason.trim() || undefined }),
      })

      const data = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Erro ao enviar solicitação." })
        return
      }

      setMessage({ type: "success", text: data.message ?? "Solicitação enviada com sucesso." })
      setReason("")
      await loadPending()
    } catch {
      setMessage({ type: "error", text: "Erro ao enviar solicitação." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Elevação de Papel</CardTitle>
        <CardDescription>
          Solicite ao Owner que eleve seu papel dentro da organização.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-[#6e5a4b]">
          <span>Papel atual:</span>
          <span className="inline-flex items-center rounded-full bg-[#ece7df] px-2.5 py-0.5 text-xs font-medium text-[#795548]">
            {currentRole}
          </span>
        </div>

        {pendingRequest ? (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <p className="font-medium">Solicitação pendente</p>
            <p className="mt-1 text-xs">
              Você solicitou o papel{" "}
              <span className="font-semibold">{pendingRequest.requestedRole}</span> em{" "}
              {formatDate(pendingRequest.createdAt)}. Aguarde a revisão do Owner.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="requested-role" className="text-xs font-medium text-[#6e5a4b]">
                Papel desejado
              </label>
              <select
                id="requested-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="h-9 w-full rounded-md border border-[#e6e0d9] bg-transparent px-2 text-sm text-[#2b221c] outline-none"
              >
                {eligibleRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="request-reason" className="text-xs font-medium text-[#6e5a4b]">
                Motivo (opcional)
              </label>
              <textarea
                id="request-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Explique por que precisa desse papel..."
                className="w-full rounded-md border border-[#e6e0d9] bg-transparent px-3 py-2 text-sm text-[#2b221c] placeholder:text-[#b0a090] outline-none resize-none"
              />
            </div>

            {message ? (
              <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
                {message.text}
              </p>
            ) : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
