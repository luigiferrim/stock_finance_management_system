import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"
import { validateUpdateLotPayload } from "@/lib/stock/validation"

// PUT /api/lots/[id] - Atualizar lote
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const lotId = validatePositiveInteger(id, "Lote")
    if (!lotId.valid) {
      return NextResponse.json({ error: lotId.error }, { status: 400 })
    }

    const userId = validatePositiveInteger(session.user.id, "Usuário")
    if (!userId.valid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await parseJsonBody(request)
    if (!body.ok) {
      return body.response
    }

    const lotPayload = validateUpdateLotPayload(body.data)
    if (!lotPayload.valid) {
      return NextResponse.json({ error: lotPayload.error }, { status: 400 })
    }

    const isStatusOnlyChange = lotPayload.value.status != null
    const organizationContext = await requirePermission(
      session,
      isStatusOnlyChange ? ["lot:change-status", "lot:edit"] : "lot:edit",
    )
    if (!organizationContext.ok) {
      return organizationContext.response
    }

    const { name, quantity, costPrice, salePrice, supplier, category, variety, process, roastDate, status } =
      lotPayload.value

    const sql = getDb()

    const lots = await sql`
      UPDATE lots
      SET
        name = COALESCE(${name ?? null}, name),
        quantity = COALESCE(${quantity ?? null}, quantity),
        cost_price = COALESCE(${costPrice ?? null}, cost_price),
        sale_price = COALESCE(${salePrice ?? null}, sale_price),
        supplier = COALESCE(${supplier ?? null}, supplier),
        category = COALESCE(${category ?? null}, category),
        variety = COALESCE(${variety ?? null}, variety),
        process = COALESCE(${process ?? null}, process),
        roast_date = COALESCE(${roastDate ?? null}, roast_date),
        status = COALESCE(${status ?? null}, status),
        updated_at = NOW()
      WHERE id = ${lotId.value}
        AND organization_id = ${organizationContext.organization.id}
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
      INSERT INTO logs (user_id, organization_id, lot_id, action, details, created_at)
      VALUES (
        ${userId.value},
        ${organizationContext.organization.id},
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
    console.error("Erro ao atualizar lote:", error)
    return NextResponse.json(
      {
        error: "Erro ao atualizar lote",
      },
      { status: 500 },
    )
  }
}
