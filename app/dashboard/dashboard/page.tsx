"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Package, AlertTriangle, TrendingUp, DollarSign, Layers } from "lucide-react"
import { NewLotModal } from "@/components/new-lot-modal"
import { STOCK_DATA_CHANGED_EVENT, STOCK_DATA_CHANGED_STORAGE_KEY } from "@/lib/stock/client-events"

interface Stats {
  totalLots: number
  totalRegisteredLots: number
  totalKg: number
  totalCost: number
  totalSaleValue: number
  profitMargin: number
  expiringLots: number
  categoryBreakdown: { category: string; quantity: number }[]
  statusBreakdown: { status: string; count: number; percent: number }[]
  monthlyBreakdown: { month: string; category: string; quantity: number }[]
  updatedAt: string
}

const STATUS_COLORS: Record<string, string> = {
  Encomendado: "rgb(91,122,168)",
  Chegou: "rgb(140,110,175)",
  "Em Estoque": "rgb(95,145,95)",
  Embalado: "rgb(210,145,70)",
  Vendido: "rgb(140,140,140)",
}

const CAT_COLORS: Record<string, string> = {
  "Single Origin": "#795548",
  Blend: "#b48c64",
}

const FALLBACK_COLOR = "rgb(170,150,130)"
const FALLBACK_CAT = "#a09080"

const PT_MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" })
      if (!res.ok) throw new Error("Não foi possível carregar o dashboard.")
      setStats(await res.json())
    } catch (err) {
      console.error("Erro ao buscar dados:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const refetch = () => { if (!cancelled) void fetchData() }
    const handleVisibility = () => { if (document.visibilityState === "visible") refetch() }
    const handleStorage = (e: StorageEvent) => { if (e.key === STOCK_DATA_CHANGED_STORAGE_KEY) refetch() }

    refetch()
    window.addEventListener("focus", refetch)
    window.addEventListener(STOCK_DATA_CHANGED_EVENT, refetch)
    window.addEventListener("storage", handleStorage)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelled = true
      window.removeEventListener("focus", refetch)
      window.removeEventListener(STOCK_DATA_CHANGED_EVENT, refetch)
      window.removeEventListener("storage", handleStorage)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [fetchData])

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  const monthlyChartData = useMemo(() => {
    const rows = stats?.monthlyBreakdown ?? []
    const monthMap = new Map<string, Record<string, number>>()
    for (const row of rows) {
      if (!monthMap.has(row.month)) monthMap.set(row.month, {})
      monthMap.get(row.month)![row.category] = row.quantity
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, cats]) => {
        const idx = parseInt(ym.split("-")[1] ?? "1", 10) - 1
        return { month: PT_MONTHS[idx] ?? ym, ...cats }
      })
  }, [stats])

  const chartCategories = useMemo(
    () => [...new Set((stats?.monthlyBreakdown ?? []).map((r) => r.category))],
    [stats],
  )

  const statusData = useMemo(
    () =>
      (stats?.statusBreakdown ?? []).map((item) => ({
        name: item.status,
        value: item.count,
        percent: item.percent,
        fill: STATUS_COLORS[item.status] ?? FALLBACK_COLOR,
      })),
    [stats],
  )

  const profitMarginPct =
    stats?.totalSaleValue && stats.totalSaleValue > 0
      ? ((stats.profitMargin / stats.totalSaleValue) * 100).toFixed(1)
      : "0"

  const firstName =
    sessionStatus === "authenticated" && session?.user?.name
      ? session.user.name.split(" ")[0]
      : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo{firstName ? `, ${firstName}` : ""} ☕
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Resumo dos lotes, volume e receita potencial da sua torrefação.
          </p>
        </div>
        <NewLotModal onSuccess={fetchData} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Lotes ativos"
          value={String(stats?.totalLots ?? 0)}
          sub="Encomendado, Chegou, Em Estoque e Embalado"
          icon={<Package className="w-5 h-5 text-[#795548]" />}
          iconBg="bg-[#795548]/10"
        />
        <KpiCard
          label="Volume total"
          value={`${(stats?.totalKg ?? 0).toLocaleString("pt-BR")} kg`}
          sub="Somatório de lotes ativos"
          icon={<Layers className="w-5 h-5 text-[#795548]" />}
          iconBg="bg-[#795548]/10"
        />
        <KpiCard
          label="Envelhecidos"
          value={String(stats?.expiringLots ?? 0)}
          sub="Torra há mais de 60 dias"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-500/10"
          valueClassName={(stats?.expiringLots ?? 0) > 0 ? "text-amber-600" : undefined}
        />
        <KpiCard
          label="Margem projetada"
          value={`${profitMarginPct}%`}
          sub="Sobre receita potencial"
          icon={<TrendingUp className="w-5 h-5 text-[#5a7a44]" />}
          iconBg="bg-[#5a7a44]/10"
          valueClassName="text-[#5a7a44]"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grouped bar chart */}
        <Card className="lg:col-span-2 rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Volume por categoria</CardTitle>
            <CardDescription>Distribuição do estoque ativo (kg)</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e0d9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6e5a4b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6e5a4b" }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e6e0d9",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      fontSize: 13,
                    }}
                    formatter={(v: unknown) => [
                      `${Number(v).toLocaleString("pt-BR")} kg`,
                    ]}
                  />
                  {chartCategories.map((cat) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      name={cat}
                      fill={CAT_COLORS[cat] ?? FALLBACK_CAT}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
            {chartCategories.length > 0 && (
              <div className="flex items-center gap-5 mt-3 px-1">
                {chartCategories.map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5 text-xs text-[#6e5a4b]">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CAT_COLORS[cat] ?? FALLBACK_CAT }}
                    />
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut */}
        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status dos lotes</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Sem dados
              </div>
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e6e0d9",
                          fontSize: 13,
                        }}
                        formatter={(v) => [`${v} lote(s)`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-2xl font-bold text-foreground">{stats?.totalRegisteredLots ?? 0}</p>
                    <p className="text-xs text-muted-foreground">lotes</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {statusData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-xs text-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial summary */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Valor total investido"
            value={formatCurrency(stats?.totalCost ?? 0)}
            icon={<DollarSign className="w-5 h-5 text-[#795548]" />}
            iconBg="bg-[#795548]/10"
          />
          <KpiCard
            label="Receita total potencial"
            value={formatCurrency(stats?.totalSaleValue ?? 0)}
            icon={<DollarSign className="w-5 h-5 text-[#795548]" />}
            iconBg="bg-[#795548]/10"
          />
          <KpiCard
            label="Lucro líquido projetado"
            value={formatCurrency(stats?.profitMargin ?? 0)}
            icon={<DollarSign className="w-5 h-5 text-[#5a7a44]" />}
            iconBg="bg-[#5a7a44]/10"
            valueClassName={(stats?.profitMargin ?? 0) >= 0 ? "text-[#5a7a44]" : "text-destructive"}
          />
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueClassName,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  valueClassName?: string
}) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-2 ${valueClassName ?? "text-foreground"}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
