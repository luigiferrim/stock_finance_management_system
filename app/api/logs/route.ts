import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sql = getDb()

    const logs = await sql`
      SELECT 
        logs.id,
        logs.action,
        logs.details,
        logs.created_at as "createdAt",
        users.name as user_name,
        users.email as user_email,
        lots.name as lot_name
      FROM logs
      LEFT JOIN users ON logs.user_id = users.id
      LEFT JOIN lots ON logs.lot_id = lots.id
      ORDER BY logs.created_at DESC
      LIMIT 100
    `

    const logsArray = Array.isArray(logs) ? logs : []

    const formattedLogs = logsArray.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
      user: {
        name: log.user_name || "Sistema",
        email: log.user_email || "",
      },
      lot: log.lot_name ? { name: log.lot_name } : null,
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error("Erro ao buscar logs:", error)
    return NextResponse.json([])
  }
}
