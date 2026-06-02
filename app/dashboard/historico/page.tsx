"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface Log {
  id: string
  action: string
  details: string | null
  createdAt: string
  user: { name: string; email: string }
  lot: { name: string } | null
}

const ACTION_OPTIONS = [
  "login",
  "logout",
  "register",
  "create_lot",
  "update_lot",
  "change_status",
  "delete_lot",
  "change_password",
  "access_granted",
  "access_denied",
  "security_alert",
  "upgrade_password_hash",
  "create_organization",
] as const

const ACTION_META: Record<string, { label: string; badgeClassName: string }> = {
  login: { label: "Login", badgeClassName: "bg-blue-500/10 text-blue-600" },
  logout: { label: "Logout", badgeClassName: "bg-gray-500/10 text-gray-600" },
  register: { label: "Registro", badgeClassName: "bg-green-500/10 text-green-600" },
  create_lot: { label: "Criar Lote", badgeClassName: "bg-green-500/10 text-green-600" },
  update_lot: { label: "Atualizar Lote", badgeClassName: "bg-yellow-500/10 text-yellow-600" },
  change_status: { label: "Alterar Status", badgeClassName: "bg-amber-500/10 text-amber-600" },
  delete_lot: { label: "Deletar Lote", badgeClassName: "bg-red-500/10 text-red-600" },
  change_password: { label: "Trocar Senha", badgeClassName: "bg-purple-500/10 text-purple-600" },
  access_granted: { label: "Acesso Concedido", badgeClassName: "bg-emerald-500/10 text-emerald-600" },
  access_denied: { label: "Acesso Negado", badgeClassName: "bg-orange-500/10 text-orange-600" },
  security_alert: { label: "Alerta de Segurança", badgeClassName: "bg-red-500/10 text-red-600" },
  upgrade_password_hash: { label: "Atualização de Hash", badgeClassName: "bg-gray-500/10 text-gray-600" },
  create_organization: { label: "Criar Organização", badgeClassName: "bg-emerald-500/10 text-emerald-600" },
}

function getActionMeta(action: string) {
  return ACTION_META[action] ?? { label: action, badgeClassName: "bg-gray-500/10 text-gray-600" }
}

export default function HistoricoPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState("all")
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs")

        if (!response.ok) {
          throw new Error("Não foi possível carregar o histórico.")
        }

        const data: Log[] = await response.json()
        setLogs(data)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Erro ao carregar histórico.")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === "all" || log.action === selectedAction
    const searchableText = [log.details ?? "", log.user.name, log.user.email, log.lot?.name ?? ""]
      .join(" ")
      .toLowerCase()
    const matchesSearch = normalizedSearch.length === 0 || searchableText.includes(normalizedSearch)

    return matchesAction && matchesSearch
  })

  const totalEvents = logs.length
  const createdLots = logs.filter((log) => log.action === "create_lot").length
  const deletedLots = logs.filter((log) => log.action === "delete_lot").length

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Auditoria</h1>
          <p className="text-muted-foreground">Registro completo de todas as ações no sistema</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Auditoria</h1>
          <p className="text-muted-foreground">Registro completo de todas as ações no sistema</p>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Não foi possível carregar o histórico</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Auditoria</h1>
        <p className="text-muted-foreground">Registro completo de todas as ações no sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine os registros por texto livre ou tipo de ação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder={isMobile ? "Buscar..." : "Buscar por detalhes, usuário, e-mail ou lote"}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {getActionMeta(action).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>Acompanhe a atividade registrada pelas rotas do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const actionMeta = getActionMeta(log.action)
              const createdAt = new Date(log.createdAt)

              return (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${actionMeta.badgeClassName}`}
                      >
                        {actionMeta.label}
                      </span>
                      <span className="text-sm text-muted-foreground">por {log.user.name}</span>
                    </div>

                    {log.details ? <p className="text-sm text-foreground">{log.details}</p> : null}

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{log.user.email}</p>
                      {log.lot ? <p>Lote relacionado: {log.lot.name}</p> : null}
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-muted-foreground md:text-right">
                    <p>{formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })}</p>
                    <p>{createdAt.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              {logs.length === 0
                ? "Nenhum registro de auditoria ainda"
                : "Nenhum registro encontrado com os filtros aplicados"}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Auditoria</CardTitle>
          <CardDescription>Métricas rápidas dos eventos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total de eventos</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Lotes criados</p>
              <p className="text-2xl font-bold">{createdLots}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Lotes deletados</p>
              <p className="text-2xl font-bold">{deletedLots}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
