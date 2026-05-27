import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { ACTIVE_LOT_STATUSES } from "@/lib/stock/constants"

export const dynamic = "force-dynamic"

const NO_STORE_HEADERS = { "Cache-Control": "no-store" }

function toNumber(value: unknown) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function toInteger(value: unknown) {
  const number = Number.parseInt(String(value ?? "0"), 10)
  return Number.isFinite(number) ? number : 0
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401, headers: NO_STORE_HEADERS })
    }

    const sql = getDb()
    const activeStatuses = [...ACTIVE_LOT_STATUSES]

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [activeTotalsResult, totalRegisteredResult, expiringLotsResult, categoryRows, statusRows, monthlyRows] =
      await Promise.all([
        sql`
          SELECT
            COUNT(*) as total_lots,
            COALESCE(SUM(quantity), 0) as total_kg,
            COALESCE(SUM(quantity * cost_price), 0) as total_cost,
            COALESCE(SUM(quantity * sale_price), 0) as total_sale_value
          FROM lots
          WHERE status = ANY(${activeStatuses})
        `,
        sql`
          SELECT COUNT(*) as count FROM lots
        `,
        sql`
          SELECT COUNT(*) as count
          FROM lots
          WHERE status = ANY(${activeStatuses})
            AND roast_date IS NOT NULL
            AND roast_date <= ${sixtyDaysAgo}
        `,
        sql`
          SELECT category, COALESCE(SUM(quantity), 0) as quantity
          FROM lots
          WHERE status = ANY(${activeStatuses})
          GROUP BY category
          ORDER BY quantity DESC, category ASC
        `,
        sql`
          SELECT COALESCE(status, 'Sem status') as status, COUNT(*) as count
          FROM lots
          GROUP BY COALESCE(status, 'Sem status')
          ORDER BY count DESC, status ASC
        `,
        sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
            category,
            COALESCE(SUM(quantity), 0) AS quantity
          FROM lots
          WHERE status = ANY(${activeStatuses})
            AND created_at >= ${sixMonthsAgo}
          GROUP BY DATE_TRUNC('month', created_at), category
          ORDER BY month ASC, category ASC
        `,
      ])

    const activeTotals = activeTotalsResult[0] ?? {}
    const totalLots = toInteger(activeTotals.total_lots)
    const totalRegisteredLots = toInteger(totalRegisteredResult[0]?.count)
    const totalKg = toNumber(activeTotals.total_kg)
    const totalCost = toNumber(activeTotals.total_cost)
    const totalSaleValue = toNumber(activeTotals.total_sale_value)
    const profitMargin = totalSaleValue - totalCost
    const expiringLots = toInteger(expiringLotsResult[0]?.count)

    const categoryBreakdown = categoryRows.map((row) => ({
      category: String(row.category || "Sem categoria"),
      quantity: toNumber(row.quantity),
    }))

    const statusBreakdown = statusRows.map((row) => {
      const count = toInteger(row.count)

      return {
        status: String(row.status || "Sem status"),
        count,
        percent: totalRegisteredLots > 0 ? Math.round((count / totalRegisteredLots) * 100) : 0,
      }
    })

    const monthlyBreakdown = monthlyRows.map((row) => ({
      month: String(row.month),
      category: String(row.category || "Sem categoria"),
      quantity: toNumber(row.quantity),
    }))

    return NextResponse.json(
      {
        totalLots,
        totalRegisteredLots,
        totalKg: roundCurrency(totalKg),
        totalCost: roundCurrency(totalCost),
        totalSaleValue: roundCurrency(totalSaleValue),
        profitMargin: roundCurrency(profitMargin),
        expiringLots,
        categoryBreakdown,
        statusBreakdown,
        monthlyBreakdown,
        updatedAt: new Date().toISOString(),
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)

    return NextResponse.json(
      {
        totalLots: 0,
        totalRegisteredLots: 0,
        totalKg: 0,
        totalCost: 0,
        totalSaleValue: 0,
        profitMargin: 0,
        expiringLots: 0,
        categoryBreakdown: [],
        statusBreakdown: [],
        monthlyBreakdown: [],
        updatedAt: new Date().toISOString(),
        error: "Erro ao carregar estatísticas",
      },
      { status: 200, headers: NO_STORE_HEADERS },
    )
  }
}
