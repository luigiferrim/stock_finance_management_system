import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

// PUT /api/lots/[id] - Atualizar lote
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, quantity, costPrice, salePrice, supplier, category, variety, process, roastDate, status } = body

    const sql = getDb()

    const lots = await sql`
      UPDATE lots
      SET
        name = COALESCE(${name}, name),
        quantity = COALESCE(${quantity ? Number.parseFloat(quantity) : null}, quantity),
        cost_price = COALESCE(${costPrice ? Number.parseFloat(costPrice) : null}, cost_price),
        sale_price = COALESCE(${salePrice ? Number.parseFloat(salePrice) : null}, sale_price),
        supplier = COALESCE(${supplier}, supplier),
        category = COALESCE(${category}, category),
        variety = COALESCE(${variety}, variety),
        process = COALESCE(${process}, process),
        roast_date = COALESCE(${roastDate ? new Date(roastDate) : null}, roast_date),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${Number.parseInt(id)}
      RETURNING *
    `

    if (lots.length === 0) {
      return NextResponse.json({ error: "Lote não encontrado" }, { status: 404 })
    }

    const lot = lots[0]

    const actionDetails = status
      ? `Status do lote "${lots[0].name}" alterado para "${status}"`
      : `Lote "${name || lots[0].name}" foi atualizado`

    await sql`
      INSERT INTO logs (user_id, lot_id, action, details, created_at)
      VALUES (
        ${Number.parseInt(session.user.id)},
        ${lot.id},
        ${status ? "change_status" : "update_lot"},
        ${actionDetails},
        NOW()
      )
    `

    const formattedLot = {
      id: lot.id,
      name: lot.name,
      quantity: lot.quantity,
      costPrice: lot.cost_price,
      salePrice: lot.sale_price,
      supplier: lot.supplier,
      category: lot.category,
      variety: lot.variety,
      process: lot.process,
      roastDate: lot.roast_date,
      entryDate: lot.created_at,
      expiryDate: lot.expiry_date,
      status: lot.status,
    }

    return NextResponse.json(formattedLot)
  } catch (error) {
    console.error("[v0] Erro ao atualizar lote:", error)
    return NextResponse.json(
      {
        error: "Erro ao atualizar lote",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
