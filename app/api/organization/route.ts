import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validateText } from "@/lib/security/validation"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  const context = await requirePermission(session, "org:view-settings")
  if (!context.ok) return context.response
  return NextResponse.json({ id: context.organization.id, name: context.organization.name })
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "org:edit")
    if (!context.ok) return context.response

    const body = await parseJsonBody<{ name?: unknown }>(request)
    if (!body.ok) return body.response

    const name = validateText(body.data.name, { field: "Nome da organização", maxLength: 100, required: true })
    if (!name.valid || !name.value) {
      return NextResponse.json({ error: name.valid ? "Nome obrigatório" : name.error }, { status: 400 })
    }

    const sql = getDb()
    await sql`UPDATE organizations SET name = ${name.value}, updated_at = NOW() WHERE id = ${context.organization.id}`
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (${context.userId}, ${context.organization.id}, 'update_organization',
        ${`Organização renomeada para ${name.value}`}, NOW())
    `
    return NextResponse.json({ message: "Organização atualizada", name: name.value })
  } catch (error) {
    console.error("Erro ao atualizar organização:", error)
    return NextResponse.json({ error: "Erro ao atualizar organização" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "org:delete") // Owner only
    if (!context.ok) return context.response

    const sql = getDb()
    await sql`DELETE FROM organizations WHERE id = ${context.organization.id}`
    return NextResponse.json({ message: "Organização excluída" })
  } catch (error) {
    console.error("Erro ao excluir organização:", error)
    return NextResponse.json({ error: "Erro ao excluir organização" }, { status: 500 })
  }
}
