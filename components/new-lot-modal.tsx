"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewLotModalProps {
  onSuccess: () => void
  editLot?: {
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
    status?: string
  } | null
}

export function NewLotModal({ onSuccess, editLot }: NewLotModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    costPrice: "",
    salePrice: "",
    supplier: "",
    category: "",
    variety: "",
    process: "",
    roastDate: "",
    status: "Em Estoque",
  })

  useEffect(() => {
    if (editLot) {
      const formattedRoastDate = editLot.roastDate ? new Date(editLot.roastDate).toISOString().split("T")[0] : ""

      setFormData({
        name: editLot.name || "",
        quantity: editLot.quantity?.toString() || "",
        costPrice: editLot.costPrice?.toString() || "",
        salePrice: editLot.salePrice?.toString() || "",
        supplier: editLot.supplier || "",
        category: editLot.category || "",
        variety: editLot.variety || "",
        process: editLot.process || "",
        roastDate: formattedRoastDate,
        status: editLot.status || "Em Estoque",
      })
      setOpen(true)
    }
  }, [editLot])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.name?.trim()) {
        setError("Por favor, insira o nome do café")
        setLoading(false)
        return
      }

      if (!formData.category) {
        setError("Por favor, selecione uma categoria")
        setLoading(false)
        return
      }

      if (!formData.quantity || Number.parseFloat(formData.quantity) <= 0) {
        setError("A quantidade deve ser maior que zero")
        setLoading(false)
        return
      }

      if (!formData.costPrice || Number.parseFloat(formData.costPrice) < 0) {
        setError("O preço de compra não pode ser negativo")
        setLoading(false)
        return
      }

      if (!formData.salePrice || Number.parseFloat(formData.salePrice) < 0) {
        setError("O preço de venda não pode ser negativo")
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        quantity: Number.parseFloat(formData.quantity),
        costPrice: Number.parseFloat(formData.costPrice),
        salePrice: Number.parseFloat(formData.salePrice),
        supplier: formData.supplier?.trim() || "",
        category: formData.category,
        variety: formData.variety?.trim() || "",
        process: formData.process?.trim() || "",
        roastDate: formData.roastDate || "",
        status: formData.status || "Em Estoque",
      }

      const url = editLot ? `/api/lots/${editLot.id}` : "/api/lots"
      const method = editLot ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || `Erro ao ${editLot ? "atualizar" : "criar"} lote`
        const details = data.details ? ` (${data.details})` : ""
        throw new Error(errorMsg + details)
      }

      setFormData({
        name: "",
        quantity: "",
        costPrice: "",
        salePrice: "",
        supplier: "",
        category: "",
        variety: "",
        process: "",
        roastDate: "",
        status: "Em Estoque",
      })
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(`[v0] Erro ao ${editLot ? "atualizar" : "criar"} lote:`, error)
      setError(
        error instanceof Error ? error.message : `Erro ao ${editLot ? "atualizar" : "criar"} lote. Tente novamente.`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#8B6F47] hover:bg-[#8B6F47]/90">Novo Lote</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editLot ? "Editar Lote de Café" : "Adicionar Novo Lote de Café"}
          </DialogTitle>
          <DialogDescription>
            {editLot
              ? "Atualize as informações do lote abaixo"
              : "Preencha as informações abaixo para adicionar um novo lote ao estoque"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Café *</Label>
            <Input
              id="name"
              placeholder="Ex: Grão Especial Microlote"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blend">Blend</SelectItem>
                  <SelectItem value="Single Origin">Single Origin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade (kg) *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="0.01"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variety">Variedade</Label>
              <Input
                id="variety"
                placeholder="Ex: Bourbon Amarelo"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process">Processo</Label>
              <Input
                id="process"
                placeholder="Ex: Natural, Lavado"
                value={formData.process}
                onChange={(e) => setFormData({ ...formData, process: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Compra (R$/kg) *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="55.00"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda (R$/kg) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="95.00"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              placeholder="Nome do fornecedor"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roastDate">Data da Torra</Label>
              <Input
                id="roastDate"
                type="date"
                value={formData.roastDate}
                onChange={(e) => setFormData({ ...formData, roastDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
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
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#8B6F47] hover:bg-[#8B6F47]/90">
              {loading ? "Salvando..." : editLot ? "Atualizar Lote" : "Salvar Lote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}