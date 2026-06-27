"use client"

import { useEffect, useState } from "react"
import { NewLotModal } from "@/components/new-lot-modal"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertTriangle, Pencil, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { notifyStockChanged } from "@/lib/stock/client-events"
import { LOT_STATUS_GROUPS } from "@/lib/stock/constants"
import { RoleGate } from "@/components/auth/role-gate"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

interface Lot {
  id: string
  name: string
  quantity: number
  costPrice: number
  salePrice: number
  supplier: string
  category: string
  variety?: string
  process?: string
  roastDate?: string
  entryDate: string
  expiryDate: string | null
  status: string
}

export default function EstoquePage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [filteredLots, setFilteredLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionError, setActionError] = useState("")
  const [editingLot, setEditingLot] = useState<Lot | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchLots()
  }, [])

  useEffect(() => {
    const filtered = lots.filter(
      (lot) =>
        lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredLots(filtered)
  }, [searchTerm, lots])

  const fetchLots = async () => {
    try {
      setError(false)
      const response = await fetch("/api/lots", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao buscar lotes")
      }

      if (!Array.isArray(data)) {
        throw new Error("Resposta inesperada ao buscar lotes")
      }

      setLots(data)
      setFilteredLots(data)
    } catch (fetchError) {
      console.error("Erro ao buscar lotes:", fetchError)
      setLots([])
      setFilteredLots([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este lote?")) return

    try {
      setActionError("")
      const response = await fetch(`/api/lots/${id}/delete`, { method: "POST" })

      if (!response.ok) throw new Error("Erro ao deletar lote")

      notifyStockChanged()
      fetchLots()
    } catch (error) {
      console.error("Erro ao deletar lote:", error)
      setActionError("Não foi possível deletar o lote. Tente novamente.")
    }
  }

  const handleEdit = (lot: Lot) => {
    setEditingLot(lot)
  }

  const handleSuccess = () => {
    setEditingLot(null)
    fetchLots()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleStatusChange = async (lotId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar status")

      setActionError("")
      notifyStockChanged()
      fetchLots()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      setActionError("Não foi possível atualizar o status. Tente novamente.")
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Encomendado: "bg-blue-100 text-blue-800 border-blue-200",
      Chegou: "bg-purple-100 text-purple-800 border-purple-200",
      "Em Estoque": "bg-green-100 text-green-800 border-green-200",
      Embalado: "bg-orange-100 text-orange-800 border-orange-200",
      Vendido: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-muted text-muted-foreground"
  }

  if (loading) {
    return (
      <PageContainer role="status" aria-busy="true" aria-live="polite" className="space-y-6">
        <span className="sr-only">Carregando o estoque…</span>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <Skeleton className="h-9 w-36 shrink-0" />
        </div>

        {/* Search */}
        <Skeleton className="h-12 w-full max-w-md" />

        {/* Table */}
        <TableSkeleton columns={8} rows={6} />
      </PageContainer>
    )
  }

  // Erro e vazio são mutuamente exclusivos: em falha de carga mostramos só o
  // ErrorState, nunca a tabela vazia.
  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Não foi possível carregar o estoque."
          message="Houve um problema ao carregar seus lotes. Tente novamente."
          onRetry={() => {
            setLoading(true)
            void fetchLots()
          }}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lotes <strong>em processo</strong> contam no estoque e na análise potencial.{" "}
            <strong>Vendido</strong> marca o lote como vendido integralmente (100%) e passa para o realizado.
          </p>
        </div>
        <RoleGate action="lot:create">
          <NewLotModal onSuccess={handleSuccess} editLot={editingLot} />
        </RoleGate>
      </div>

      {actionError && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={isMobile ? "Buscar..." : "Buscar por nome ou categoria..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-border overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-muted/30">
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-semibold text-foreground">NOME DO CAFÉ</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">CATEGORIA</th>
              <th className="text-left p-4 text-sm font-semibold text-foreground">STATUS</th>
              <th className="text-center p-4 text-sm font-semibold text-foreground">QUANTIDADE</th>
              <th className="text-right p-4 text-sm font-semibold text-foreground">PREÇO DE COMPRA</th>
              <th className="text-right p-4 text-sm font-semibold text-foreground">PREÇO DE VENDA</th>
              <th className="text-center p-4 text-sm font-semibold text-foreground">IDADE DO LOTE</th>
              <th className="text-center p-4 text-sm font-semibold text-foreground">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredLots.map((lot) => {
              const daysOld = Math.ceil(
                (new Date().getTime() - new Date(lot.entryDate).getTime()) / (1000 * 60 * 60 * 24),
              )
              const isOld = daysOld > 60

              return (
                <tr key={lot.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4 text-sm text-foreground">{lot.name}</td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-muted text-sm rounded-md text-foreground">
                      {lot.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <RoleGate
                      action="lot:change-status"
                      fallback={
                        <span
                          className={`inline-flex w-[140px] items-center justify-center rounded-md border px-3 py-1.5 text-sm ${getStatusColor(lot.status)}`}
                        >
                          {lot.status}
                        </span>
                      }
                    >
                      <Select value={lot.status} onValueChange={(value) => handleStatusChange(lot.id, value)}>
                        <SelectTrigger className={`w-[140px] border ${getStatusColor(lot.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOT_STATUS_GROUPS.map((group, groupIndex) => (
                            <SelectGroup key={group.label}>
                              {groupIndex > 0 && <SelectSeparator />}
                              <SelectLabel title={group.description}>{group.label}</SelectLabel>
                              {group.statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </RoleGate>
                  </td>
                  <td className="p-4 text-sm text-center text-foreground">{lot.quantity} kg</td>
                  <td className="p-4 text-sm text-right text-foreground">{formatCurrency(lot.costPrice)}</td>
                  <td className="p-4 text-sm text-right font-semibold text-foreground">
                    {formatCurrency(lot.salePrice)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {isOld && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <span className={`text-sm ${isOld ? "text-destructive font-semibold" : "text-foreground"}`}>
                        {daysOld} dias
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <RoleGate action="lot:edit">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          onClick={() => handleEdit(lot)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </RoleGate>
                      <RoleGate action="lot:delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => handleDelete(lot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </RoleGate>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredLots.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            {searchTerm ? "Nenhum lote encontrado" : "Nenhum lote cadastrado"}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
