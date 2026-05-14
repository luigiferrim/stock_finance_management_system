import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"

const ACTIVE_STATUSES = ["Encomendado", "Chegou", "Em Estoque", "Embalado"]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sql = getDb()

    const totalLotsResult = await sql`
      SELECT COUNT(*) as count FROM lots WHERE status = ANY(${ACTIVE_STATUSES})
    `
    const totalLots = Number.parseInt(totalLotsResult[0]?.count || "0")

    const lotsData = await sql`
      SELECT quantity, cost_price, sale_price
      FROM lots
      WHERE status = ANY(${ACTIVE_STATUSES})
    `

    const totalCost = lotsData.reduce((sum, lot) => {
      const qty = Number.parseFloat(lot.quantity || "0")
      const cost = Number.parseFloat(lot.cost_price || "0")
      return sum + qty * cost
    }, 0)

    const totalSaleValue = lotsData.reduce((sum, lot) => {
      const qty = Number.parseFloat(lot.quantity || "0")
      const sale = Number.parseFloat(lot.sale_price || "0")
      return sum + qty * sale
    }, 0)

    const profitMargin = totalSaleValue - totalCost

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const expiringLotsResult = await sql`
      SELECT COUNT(*) as count
      FROM lots
      WHERE status = ANY(${ACTIVE_STATUSES})
        AND roast_date IS NOT NULL
        AND roast_date <= ${sixtyDaysAgo}
    `
    const expiringLots = Number.parseInt(expiringLotsResult[0]?.count || "0")

    return NextResponse.json({
      totalLots,
      totalCost: Math.round(totalCost * 100) / 100,
      totalSaleValue: Math.round(totalSaleValue * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      expiringLots,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)

    return NextResponse.json(
      {
        totalLots: 0,
        totalCost: 0,
        totalSaleValue: 0,
        profitMargin: 0,
        expiringLots: 0,
        error: "Erro ao carregar estatísticas",
      },
      { status: 200 },
    )
  }
}
