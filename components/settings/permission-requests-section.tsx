"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error-state"
import { ListSkeleton } from "@/components/skeletons/list-skeleton"
import { can } from "@/lib/auth/permissions"
import { useRole } from "@/lib/auth/use-permissions"

interface PermissionRequest {
  id: number
  requesterName: string
  requesterEmail: string
  requesterCurrentRole: string
  requestedRole: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  reviewedByName: string | null
  reviewedAt: string | null
  createdAt: string
}

interface PermissionRequestsResponse {
  requests: PermissionRequest[]
  error?: string
}

const badgeClass =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function PermissionRequestsSection() {
  const currentRole = useRole()

  const [requests, setRequests] = useState<PermissionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [actionError, setActionError] = useState("")
  const [processing, setProcessing] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/permission-requests", { cache: "no-store" })
      const data = (await response.json()) as PermissionRequestsResponse

      if (!response.ok) {
        setError(true)
        return
      }

      setRequests(data.requests)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const retryLoad = useCallback(() => {
    setLoading(true)
    void load()
  }, [load])

  if (!currentRole || !can(currentRole, "org:view-settings")) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Permissão</CardTitle>
          <CardDescription>
            Revise pedidos de elevação de papel feitos por membros da organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">Carregando as solicitações…</span>
            <ListSkeleton rows={2} />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Permissão</CardTitle>
          <CardDescription>
            Revise pedidos de elevação de papel feitos por membros da organização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState
            variant="section"
            title="Não foi possível carregar as solicitações."
            message="Tente novamente."
            onRetry={retryLoad}
          />
        </CardContent>
      </Card>
    )
  }

  async function handleAction(requestId: number, action: "approve" | "reject") {
    setActionError("")
    setProcessing(requestId)
    try {
      const response = await fetch(`/api/permission-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setActionError(data.error ?? "Não foi possível processar a ação.")
      } else {
        setActionError("")
      }
    } catch {
      setActionError("Erro ao processar a ação.")
    } finally {
      setProcessing(null)
      await load()
    }
  }

  const pending = requests.filter((r) => r.status === "pending")
  const reviewed = requests.filter((r) => r.status !== "pending")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Permissão</CardTitle>
        <CardDescription>
          Revise pedidos de elevação de papel feitos por membros da organização.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[#2b221c]">Pendentes</h3>
          {pending.length === 0 ? (
            <p className="text-sm text-[#6e5a4b]">Nenhuma solicitação pendente.</p>
          ) : (
            pending.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[#e6e0d9] px-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium text-[#2b221c]">{req.requesterName}</p>
                  <p className="truncate text-xs text-[#6e5a4b]">{req.requesterEmail}</p>
                  <p className="text-xs text-[#6e5a4b]">
                    <span className={`${badgeClass} bg-[#ece7df] text-[#6e5a4b]`}>
                      {req.requesterCurrentRole}
                    </span>
                    <span className="mx-1">→</span>
                    <span className={`${badgeClass} bg-[#ece7df] text-[#6e5a4b]`}>
                      {req.requestedRole}
                    </span>
                  </p>
                  {req.reason ? (
                    <p className="text-xs text-[#6e5a4b]">
                      <span className="font-medium">Motivo: </span>
                      {req.reason}
                    </p>
                  ) : null}
                  <p className="text-xs text-[#6e5a4b]">Enviada em {formatDate(req.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2 self-center">
                  <Button
                    size="sm"
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={processing === req.id}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={processing === req.id}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {reviewed.length > 0 ? (
          <div className="space-y-2 border-t border-[#e6e0d9] pt-4">
            <h3 className="text-sm font-semibold text-[#2b221c]">Histórico</h3>
            {reviewed.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e6e0d9] px-4 py-3 opacity-75"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium text-[#2b221c]">{req.requesterName}</p>
                  <p className="text-xs text-[#6e5a4b]">
                    <span className={`${badgeClass} bg-[#ece7df] text-[#6e5a4b]`}>
                      {req.requesterCurrentRole}
                    </span>
                    <span className="mx-1">→</span>
                    <span className={`${badgeClass} bg-[#ece7df] text-[#6e5a4b]`}>
                      {req.requestedRole}
                    </span>
                  </p>
                </div>
                <span className={`${badgeClass} ${statusBadge[req.status] ?? ""}`}>
                  {statusLabel[req.status] ?? req.status}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
