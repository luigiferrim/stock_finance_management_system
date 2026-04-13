"use client"

import { useEffect, useState } from "react"
import { NewLotModal } from "@/components/new-lot-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertTriangle, Pencil, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [editingLot, setEditingLot] = useState<Lot | null>(null)

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
      const response = await fetch("/api/lots")
      const data = await response.json()
      setLots(data)
      setFilteredLots(data)
    } catch (error) {
      console.error("[v0] Erro ao buscar lotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este lote?")) return

    try {
      await fetch(`/api/lots/${id}/delete`, { method: "POST" })
      fetchLots()
    } catch (error) {
      console.error("[v0] Erro ao deletar lote:", error)
      alert("Erro ao deletar lote")
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

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const handleStatusChange = async (lotId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar status")

      fetchLots()
    } catch (error) {
      console.error("[v0] Erro ao atualizar status:", error)
      alert("Erro ao atualizar status")
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
        <NewLotModal onSuccess={handleSuccess} editLot={editingLot} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full">
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
                    <Select value={lot.status} onValueChange={(value) => handleStatusChange(lot.id, value)}>
                      <SelectTrigger className={`w-[140px] border ${getStatusColor(lot.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Encomendado">Encomendado</SelectItem>
                        <SelectItem value="Chegou">Chegou</SelectItem>
                        <SelectItem value="Em Estoque">Em Estoque</SelectItem>
                        <SelectItem value="Embalado">Embalado</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        onClick={() => handleEdit(lot)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => handleDelete(lot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
    </div>
  )
}