import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const organizationContext = await requirePermission(session, "lot:delete")
    if (!organizationContext.ok) {
      return organizationContext.response
    }

    const lots = await sql`
      SELECT * FROM lots
      WHERE id = ${lotId.value}
        AND organization_id = ${organizationContext.organization.id}
      LIMIT 1
    `

    if (lots.length === 0) {
      return NextResponse.json({ error: "Lote não encontrado" }, { status: 404 })
    }

    const lot = lots[0]

    await sql`
      INSERT INTO logs (user_id, organization_id, lot_id, action, details, created_at)
      VALUES (
        ${userId.value},
        ${organizationContext.organization.id},
        ${lot.id},
        'delete_lot',
        ${`Lote "${lot.name}" foi deletado`},
        NOW()
      )
    `

    await sql`
      DELETE FROM lots
      WHERE id = ${lotId.value}
        AND organization_id = ${organizationContext.organization.id}
    `

    return NextResponse.json({ message: "Lote deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar lote:", error)
    return NextResponse.json({ error: "Erro ao deletar lote" }, { status: 500 })
  }
}
