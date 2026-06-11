import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { logActionFilterForRole } from "@/lib/auth/permissions"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const organizationContext = await requirePermission(session, ["history:view-full", "history:view-domain"])
    if (!organizationContext.ok) {
      return organizationContext.response
    }

    const actionFilter = logActionFilterForRole(organizationContext.role)

    const sql = getDb()

    const organizationId = organizationContext.organization.id

    const logs = actionFilter === null
      ? await sql`
          SELECT logs.id, logs.action, logs.details, logs.created_at as "createdAt",
                 users.name as user_name, users.email as user_email, lots.name as lot_name
          FROM logs
          LEFT JOIN users ON logs.user_id = users.id
          LEFT JOIN lots ON logs.lot_id = lots.id AND lots.organization_id = logs.organization_id
          WHERE logs.organization_id = ${organizationId}
          ORDER BY logs.created_at DESC
          LIMIT 100
        `
      : await sql`
          SELECT logs.id, logs.action, logs.details, logs.created_at as "createdAt",
                 users.name as user_name, users.email as user_email, lots.name as lot_name
          FROM logs
          LEFT JOIN users ON logs.user_id = users.id
          LEFT JOIN lots ON logs.lot_id = lots.id AND lots.organization_id = logs.organization_id
          WHERE logs.organization_id = ${organizationId}
            AND logs.action = ANY(${[...actionFilter]})
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
