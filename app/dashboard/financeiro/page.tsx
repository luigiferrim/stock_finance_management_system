"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ACTIVE_LOT_STATUSES } from "@/lib/stock/constants"

interface Lot {
  id: number
  name: string
  quantity: number
  costPrice: number
  salePrice: number
  category: string
  status: string
}

interface CategoryBreakdown {
  name: string
  value: number
  fill: string
}

const activeStatuses = new Set<string>(ACTIVE_LOT_STATUSES)
const chartColors = ["#795548", "#a1887f", "#d7ccc8", "#8d6e63", "#bcaaa4"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export default function FinanceiroPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLots() {
      try {
        const response = await fetch("/api/lots", { cache: "no-store" })

        if (!response.ok) {
          throw new Error("Não foi possível carregar os lotes.")
        }

        const data: Lot[] = await response.json()
        setLots(data.filter((lot) => activeStatuses.has(lot.status)))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Erro ao carregar os dados financeiros.")
      } finally {
        setLoading(false)
      }
    }

    loadLots()
  }, [])

  const totalCost = lots.reduce((total, lot) => total + lot.quantity * lot.costPrice, 0)
  const potentialRevenue = lots.reduce((total, lot) => total + lot.quantity * lot.salePrice, 0)
  const estimatedProfit = potentialRevenue - totalCost
  const profitMargin = potentialRevenue > 0 ? (estimatedProfit / potentialRevenue) * 100 : 0

  const categoryTotals = lots.reduce<Record<string, number>>((totals, lot) => {
    totals[lot.category] = (totals[lot.category] ?? 0) + lot.quantity * lot.salePrice
    return totals
  }, {})

  const categoryData: CategoryBreakdown[] = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    fill: chartColors[index % chartColors.length],
  }))

  const topLots = [...lots]
    .sort((first, second) => second.quantity * second.salePrice - first.quantity * first.salePrice)
    .slice(0, 5)

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando análise financeira...</div>
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Análise Financeira</h1>
        <p className="text-sm text-muted-foreground">Acompanhe custos, receita potencial e rentabilidade dos lotes ativos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Receita Potencial</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(potentialRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Lucro Estimado</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(estimatedProfit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Margem de Lucro</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatPercent(profitMargin)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
            <CardDescription>Participação financeira dos lotes ativos</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há lotes ativos para analisar.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" innerRadius={65} outerRadius={95} paddingAngle={2}>
                      {categoryData.map((item) => (
                        <Cell key={item.name} fill={item.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Lotes</CardTitle>
            <CardDescription>Maiores valores totais de venda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lote ativo encontrado.</p>
            ) : (
              topLots.map((lot) => (
                <div key={lot.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{lot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lot.quantity} kg · {lot.category}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">{formatCurrency(lot.quantity * lot.salePrice)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise por Lote</CardTitle>
          <CardDescription>Comparação entre custo, venda e lucro por quilo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Lote</th>
                  <th className="pb-3 font-medium">Categoria</th>
                  <th className="pb-3 font-medium">Quantidade</th>
                  <th className="pb-3 font-medium">Custo/kg</th>
                  <th className="pb-3 font-medium">Venda/kg</th>
                  <th className="pb-3 font-medium">Lucro/kg</th>
                  <th className="pb-3 font-medium">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id} className="border-b last:border-b-0">
                    <td className="py-3 font-medium text-foreground">{lot.name}</td>
                    <td className="py-3">{lot.category}</td>
                    <td className="py-3">{lot.quantity} kg</td>
                    <td className="py-3">{formatCurrency(lot.costPrice)}</td>
                    <td className="py-3">{formatCurrency(lot.salePrice)}</td>
                    <td className="py-3">{formatCurrency(lot.salePrice - lot.costPrice)}</td>
                    <td className="py-3">{formatCurrency(lot.quantity * lot.salePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
