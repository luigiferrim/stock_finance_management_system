"use client"

import { useCallback, useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ACTIVE_LOT_STATUSES, SOLD_LOT_STATUS } from "@/lib/stock/constants"
import { PermissionDenied } from "@/components/auth/role-gate"
import { usePermission } from "@/lib/auth/use-permissions"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

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
  const canViewFinancials = usePermission("financials:view")
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadLots = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const response = await fetch("/api/lots", { cache: "no-store" })

      if (!response.ok) {
        throw new Error("Resposta não-ok ao carregar os lotes.")
      }

      const data: Lot[] = await response.json()
      setLots(data)
    } catch (loadError) {
      console.error("Erro ao carregar os dados financeiros:", loadError)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLots()
  }, [loadLots])

  const activeLots = lots.filter((lot) => activeStatuses.has(lot.status))
  const soldLots = lots.filter((lot) => lot.status === SOLD_LOT_STATUS)

  // Realizado: dinheiro que de fato entrou com os lotes já vendidos.
  const realizedRevenue = soldLots.reduce((total, lot) => total + lot.quantity * lot.salePrice, 0)
  const realizedCost = soldLots.reduce((total, lot) => total + lot.quantity * lot.costPrice, 0)
  const realizedProfit = realizedRevenue - realizedCost
  const realizedMargin = realizedRevenue > 0 ? (realizedProfit / realizedRevenue) * 100 : 0

  // Potencial: projeção do estoque que ainda não foi vendido.
  const totalCost = activeLots.reduce((total, lot) => total + lot.quantity * lot.costPrice, 0)
  const potentialRevenue = activeLots.reduce((total, lot) => total + lot.quantity * lot.salePrice, 0)
  const estimatedProfit = potentialRevenue - totalCost
  const profitMargin = potentialRevenue > 0 ? (estimatedProfit / potentialRevenue) * 100 : 0

  const categoryTotals = activeLots.reduce<Record<string, number>>((totals, lot) => {
    totals[lot.category] = (totals[lot.category] ?? 0) + lot.quantity * lot.salePrice
    return totals
  }, {})

  const categoryData: CategoryBreakdown[] = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    fill: chartColors[index % chartColors.length],
  }))

  const topLots = [...activeLots]
    .sort((first, second) => second.quantity * second.salePrice - first.quantity * first.salePrice)
    .slice(0, 5)

  if (!canViewFinancials) {
    return (
      <div className="p-6">
        <PermissionDenied message="Análise financeira disponível apenas para Owner, Admin e Finance." />
      </div>
    )
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="p-4 md:p-6 lg:p-8 space-y-6"
      >
        <span className="sr-only">Carregando a análise financeira…</span>

        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>

        {/* Realizado */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-48" />
          <CardGridSkeleton count={4} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" />
        </div>

        {/* Potencial */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <CardGridSkeleton count={4} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56 max-w-full" />
            <div className="flex justify-center py-2">
              <Skeleton className="size-[190px] rounded-full" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-48 max-w-full" />
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Análise por lote */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
          <TableSkeleton columns={7} rows={5} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <ErrorState
          title="Não foi possível carregar a análise financeira."
          message="Houve um problema ao carregar seus dados. Tente novamente."
          onRetry={loadLots}
        />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Análise Financeira</h1>
        <p className="text-sm text-muted-foreground">
          Realizado é o que já entrou com lotes vendidos. Potencial é a projeção do estoque ativo.
        </p>
      </div>

      {/* Realizado */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Realizado · {soldLots.length} lote(s) vendido(s)
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Receita Realizada</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(realizedRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Custo dos Vendidos</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(realizedCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Lucro Realizado</p>
              <p className={`mt-2 text-2xl font-semibold ${realizedProfit >= 0 ? "text-[#5a7a44]" : "text-destructive"}`}>
                {formatCurrency(realizedProfit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Margem Realizada</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatPercent(realizedMargin)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Potencial */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Potencial · estoque ativo
        </p>
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
              <p className="text-sm text-muted-foreground">Lucro Projetado</p>
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
                {activeLots.map((lot) => (
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
