"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"

interface Stats {
  totalLots: number
  totalCost: number
  totalSaleValue: number
  profitMargin: number
  expiringLots: number
}

interface Lot {
  id: string
  name: string
  quantity: number
  costPrice: number
  salePrice: number
  category: string
  status: string
}

const ACTIVE_STATUSES = ["Encomendado", "Chegou", "Em Estoque", "Embalado"]

const CATEGORY_COLORS: Record<string, string> = {
  Blend: "rgb(180, 140, 100)",
  "Single Origin": "rgb(121, 85, 72)",
}

const STATUS_COLORS: Record<string, string> = {
  Encomendado: "rgb(91, 122, 168)",
  Chegou: "rgb(140, 110, 175)",
  "Em Estoque": "rgb(95, 145, 95)",
  Embalado: "rgb(210, 145, 70)",
  Vendido: "rgb(140, 140, 140)",
}

const FALLBACK_COLOR = "rgb(170, 150, 130)"

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lotsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/lots"),
        ])
        const statsData = await statsRes.json()
        const lotsData = await lotsRes.json()
        setStats(statsData)
        setLots(Array.isArray(lotsData) ? lotsData : [])
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const activeLots = useMemo(
    () => lots.filter((lot) => ACTIVE_STATUSES.includes(lot.status)),
    [lots],
  )

  const totalKg = useMemo(
    () => activeLots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0),
    [activeLots],
  )

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const lot of activeLots) {
      const category = lot.category || "Sem categoria"
      map.set(category, (map.get(category) || 0) + Number(lot.quantity || 0))
    }
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name] || FALLBACK_COLOR,
    }))
  }, [activeLots])

  const statusData = useMemo(() => {
    const map = new Map<string, number>()
    for (const lot of lots) {
      if (!lot.status) continue
      map.set(lot.status, (map.get(lot.status) || 0) + 1)
    }
    const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0) || 1
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      value: count,
      percent: Math.round((count / total) * 100),
      fill: STATUS_COLORS[name] || FALLBACK_COLOR,
    }))
  }, [lots])

  const profitMarginPercent =
    stats?.totalSaleValue && stats.totalSaleValue > 0
      ? ((stats.profitMargin / stats.totalSaleValue) * 100).toFixed(1)
      : "0"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Acompanhe as métricas mais importantes do seu negócio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Lotes ativos</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalLots || 0}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Encomendado, Chegou, Em Estoque e Embalado
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Volume total</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalKg.toLocaleString("pt-BR")} kg</p>
            <p className="text-xs text-muted-foreground mt-2">Somatório de lotes ativos</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Lotes envelhecidos</p>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.expiringLots || 0}</p>
            <p className="text-xs text-muted-foreground mt-2">Torra há mais de 60 dias</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Margem projetada</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">{profitMarginPercent}%</p>
            <p className="text-xs text-muted-foreground mt-2">Sobre receita potencial</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Volume por Categoria (kg)</CardTitle>
            <CardDescription>Distribuição do estoque ativo</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                Nenhum lote ativo cadastrado
              </div>
            ) : (
              <div className="flex items-end justify-between h-64 gap-8 px-4">
                {categoryData.map((item, i) => {
                  const max = Math.max(...categoryData.map((d) => d.value))
                  const heightPct = max > 0 ? (item.value / max) * 100 : 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {item.value.toLocaleString("pt-BR")} kg
                      </p>
                      <div
                        className="w-full rounded-t-lg transition-all hover:opacity-80"
                        style={{
                          backgroundColor: item.fill,
                          height: `${heightPct}%`,
                          minHeight: "40px",
                        }}
                      />
                      <p className="text-sm font-medium text-foreground mt-3">{item.name}</p>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="text-center mt-6">
              <p className="text-2xl font-bold text-foreground">{totalKg.toLocaleString("pt-BR")} kg</p>
              <p className="text-sm text-muted-foreground">Volume ativo total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            <CardDescription>Todos os lotes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Sem dados
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} lote(s)`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {statusData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.percent}%</span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <p className="text-2xl font-bold text-foreground">
                    {statusData.reduce((sum, item) => sum + item.value, 0)} lotes
                  </p>
                  <p className="text-sm text-muted-foreground">Total cadastrado</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Valor Total Investido</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.totalCost || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Receita Total Potencial</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.totalSaleValue || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Lucro Líquido Projetado</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.profitMargin || 0)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
