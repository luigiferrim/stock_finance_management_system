import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"
import { validateCreateLotPayload } from "@/lib/stock/validation"

// GET /api/lots - Listar todos os lotes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sql = getDb()
    const lots = await sql`
      SELECT * FROM lots
      ORDER BY created_at DESC
    `

    const formattedLots = lots.map((lot) => ({
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
    }))

    return NextResponse.json(formattedLots)
  } catch (error) {
    console.error("Erro ao buscar lotes:", error)
    return NextResponse.json({ error: "Erro ao buscar lotes. Tente novamente." }, { status: 500 })
  }
}

// POST /api/lots - Criar novo lote
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const userId = validatePositiveInteger(session.user.id, "Usuário")
    if (!userId.valid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await parseJsonBody(request)
    if (!body.ok) {
      return body.response
    }

    const lotPayload = validateCreateLotPayload(body.data)
    if (!lotPayload.valid) {
      return NextResponse.json({ error: lotPayload.error }, { status: 400 })
    }

    const { name, quantity, costPrice, salePrice, supplier, category, variety, process, roastDate, status } =
      lotPayload.value
    const sql = getDb()

    const lots = await sql`
      INSERT INTO lots (
        name, 
        quantity, 
        cost_price, 
        sale_price, 
        supplier, 
        category, 
        variety, 
        process, 
        roast_date, 
        status
      )
      VALUES (
        ${name},
        ${quantity},
        ${costPrice},
        ${salePrice},
        ${supplier},
        ${category},
        ${variety},
        ${process},
        ${roastDate},
        ${status}
      )
      RETURNING *
    `

    const lot = lots[0]

    await sql`
      INSERT INTO logs (user_id, lot_id, action, details, created_at)
      VALUES (
        ${userId.value},
        ${lot.id},
        'create_lot',
        ${`Lote "${name}" (${category}) criado com ${quantity}kg a R$${salePrice}/kg - Status: ${status}`},
        NOW()
      )
    `
    return NextResponse.json(lot, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar lote:", error)

    return NextResponse.json(
      {
        error: "Erro ao criar lote. Verifique os dados e tente novamente.",
      },
      { status: 500 },
    )
  }
}
