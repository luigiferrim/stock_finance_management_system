import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

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
    console.error("[v0] Erro ao buscar lotes:", error)
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

    const body = await request.json()
    console.log("[v0] Dados recebidos:", body)

    const { name, quantity, costPrice, salePrice, supplier, category, variety, process, roastDate, status } = body

    if (!name || !quantity || !costPrice || !salePrice || !category) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios faltando",
          details: {
            name: !name ? "Nome é obrigatório" : null,
            quantity: !quantity ? "Quantidade é obrigatória" : null,
            costPrice: !costPrice ? "Preço de compra é obrigatório" : null,
            salePrice: !salePrice ? "Preço de venda é obrigatório" : null,
            category: !category ? "Categoria é obrigatória" : null,
          },
        },
        { status: 400 },
      )
    }

    const quantityNum = Number.parseFloat(quantity)
    const costPriceNum = Number.parseFloat(costPrice)
    const salePriceNum = Number.parseFloat(salePrice)

    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ error: "A quantidade deve ser um número maior que zero" }, { status: 400 })
    }

    if (Number.isNaN(costPriceNum) || costPriceNum < 0) {
      return NextResponse.json({ error: "O preço de compra deve ser um número válido não negativo" }, { status: 400 })
    }

    if (Number.isNaN(salePriceNum) || salePriceNum < 0) {
      return NextResponse.json({ error: "O preço de venda deve ser um número válido não negativo" }, { status: 400 })
    }

    if (category !== "Blend" && category !== "Single Origin") {
      return NextResponse.json({ error: "Categoria inválida. Use 'Blend' ou 'Single Origin'" }, { status: 400 })
    }

    const sql = getDb()

    console.log("[v0] Inserindo lote no banco...")

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
        ${quantityNum},
        ${costPriceNum},
        ${salePriceNum},
        ${supplier || null},
        ${category},
        ${variety || null},
        ${process || null},
        ${roastDate ? new Date(roastDate) : null},
        ${status || "Em Estoque"}
      )
      RETURNING *
    `

    const lot = lots[0]
    console.log("[v0] Lote criado:", lot)

    await sql`
      INSERT INTO logs (user_id, lot_id, action, details, created_at)
      VALUES (
        ${Number.parseInt(session.user.id)},
        ${lot.id},
        'create_lot',
        ${`Lote "${name}" (${category}) criado com ${quantityNum}kg a R$${salePriceNum}/kg - Status: ${status || "Em Estoque"}`},
        NOW()
      )
    `

    console.log("[v0] Log criado com sucesso")

    return NextResponse.json(lot, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro detalhado ao criar lote:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return NextResponse.json(
      {
        error: "Erro ao criar lote. Verifique os dados e tente novamente.",
        details: errorMessage,
        hint: "Verifique se todas as colunas necessárias existem no banco de dados",
      },
      { status: 500 },
    )
  }
}
