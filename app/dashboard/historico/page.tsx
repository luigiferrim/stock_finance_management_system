"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock, FileText, Package, User } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type AuditLog = {
  id: string | number
  action: string
  details: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  lot: {
    name: string
  } | null
}

const actionLabels: Record<string, string> = {
  register: "Cadastro",
  create_lot: "Lote criado",
  update_lot: "Lote atualizado",
  change_status: "Status alterado",
  delete_lot: "Lote removido",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function getActionLabel(action: string) {
  return actionLabels[action] ?? action.replaceAll("_", " ")
}

export default function HistoricoPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs")

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar o historico.")
        }

        const data = await response.json()
        setLogs(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Erro ao carregar historico.")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico e Alertas</h1>
        <p className="text-muted-foreground mt-1">Logs do sistema e rastreabilidade.</p>
      </div>

      {loading && (
        <Card className="border-border bg-white">
          <CardContent className="flex h-64 items-center justify-center p-6">
            <div className="text-lg text-muted-foreground">Carregando historico...</div>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card className="border-destructive/30 bg-white">
          <CardContent className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Nao foi possivel carregar o historico</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && logs.length === 0 && (
        <Card className="border-border bg-white">
          <CardContent className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">Nenhum registro encontrado</p>
              <p className="text-sm text-muted-foreground">As atividades do sistema aparecerao aqui.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="border-border bg-white">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                          {getActionLabel(log.action)}
                        </p>
                        <p className="text-base font-medium text-foreground">{log.details}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          {log.user.name}
                          {log.user.email ? ` (${log.user.email})` : ""}
                        </span>

                        {log.lot && (
                          <span className="inline-flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            {log.lot.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <time className="shrink-0 text-sm text-muted-foreground" dateTime={log.createdAt}>
                    {formatDate(log.createdAt)}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
