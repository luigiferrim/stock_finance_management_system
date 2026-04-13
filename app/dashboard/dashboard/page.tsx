"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"

interface Stats {
  totalLots: number
  totalCost: number
  totalSaleValue: number
  profitMargin: number
  expiringLots: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const statsRes = await fetch("/api/dashboard/stats")
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (error) {
      console.error("[v0] Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Dados de exemplo para gráficos
  const categoryData = [
    { name: "Especial", value: 1500, fill: "rgb(121, 85, 72)" },
    { name: "Blend", value: 800, fill: "rgb(230, 224, 217)" },
    { name: "Microlote", value: 2200, fill: "rgb(139, 109, 87)" },
  ]

  const statusData = [
    { name: "Encomendado", value: 35, fill: "rgb(121, 85, 72)" },
    { name: "Chegou", value: 25, fill: "rgb(180, 165, 155)" },
    { name: "Embalado", value: 20, fill: "rgb(210, 205, 195)" },
    { name: "Vendido", value: 20, fill: "rgb(160, 145, 130)" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  const profitMarginPercent =
    stats?.totalSaleValue && stats.totalSaleValue > 0
      ? ((stats.profitMargin / stats.totalSaleValue) * 100).toFixed(1)
      : "0"

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Acompanhe as métricas mais importantes do seu negócio.</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Cafés encomendados</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalLots || 0}</p>
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +10%
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Cafés em estoque</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">850 kg</p>
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -2%
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Cafés embalados</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">680</p>
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15%
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Cafés vendidos</p>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.totalSaleValue || 0)}</p>
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Kg por Categoria</CardTitle>
            <CardDescription>
              Últimos 30 dias <span className="text-success">+5%</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-64 gap-8 px-4">
              {categoryData.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      backgroundColor: item.fill,
                      height: `${(item.value / Math.max(...categoryData.map((d) => d.value))) * 100}%`,
                      minHeight: "60px",
                    }}
                  />
                  <p className="text-sm font-medium text-foreground mt-3">{item.name}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-2xl font-bold text-foreground">1.500 kg</p>
              <p className="text-sm text-muted-foreground">
                Últimos 30 dias <span className="text-success">+5%</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            <CardDescription>
              Últimos 30 dias <span className="text-success">+12%</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-2xl font-bold text-foreground">2.770 un.</p>
              <p className="text-sm text-muted-foreground">
                Últimos 30 dias <span className="text-success">+12%</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Valor Total Investido</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.totalCost || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Receita Total Potencial</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.totalSaleValue || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Lucro Líquido Acumulado</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(stats?.profitMargin || 0)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}