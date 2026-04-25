import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const lots = await sql`
      SELECT * FROM lots WHERE id = ${Number.parseInt(id)} LIMIT 1
    `

    if (lots.length === 0) {
      return NextResponse.json({ error: "Lote não encontrado" }, { status: 404 })
    }

    const lot = lots[0]

    await sql`
      INSERT INTO logs (user_id, lot_id, action, details, created_at)
      VALUES (
        ${Number.parseInt(session.user.id)},
        ${lot.id},
        'delete_lot',
        ${`Lote "${lot.name}" foi deletado`},
        NOW()
      )
    `

    await sql`
      DELETE FROM lots WHERE id = ${Number.parseInt(id)}
    `

    return NextResponse.json({ message: "Lote deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar lote:", error)
    return NextResponse.json({ error: "Erro ao deletar lote" }, { status: 500 })
  }
}
