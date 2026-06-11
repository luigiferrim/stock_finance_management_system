import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { canManageMember, parseRole } from "@/lib/auth/permissions"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { countActiveOwners, deactivateMember, getMembershipById } from "@/lib/organizations/members-repository"
import { requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "member:remove")
    if (!context.ok) return context.response

    const memberId = validatePositiveInteger(id, "Membro")
    if (!memberId.valid) return NextResponse.json({ error: memberId.error }, { status: 400 })

    const target = await getMembershipById(context.organization.id, memberId.value)
    if (!target || !target.active) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })

    if (target.userId === context.userId) {
      return NextResponse.json({ error: "Você não pode remover a si mesmo" }, { status: 409 })
    }

    const targetRole = parseRole(target.role)
    if (!targetRole || !canManageMember(context.role, targetRole)) {
      return NextResponse.json({ error: "Você não pode remover este membro" }, { status: 403 })
    }

    if (targetRole === "Owner") {
      const owners = await countActiveOwners(context.organization.id)
      if (owners <= 1) {
        return NextResponse.json({ error: "A organização precisa de ao menos um Owner" }, { status: 409 })
      }
    }

    await deactivateMember(context.organization.id, memberId.value)

    const sql = getDb()
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (
        ${context.userId}, ${context.organization.id}, 'remove_member',
        ${`Membro #${memberId.value} (${targetRole}) removido da organização`}, NOW()
      )
    `

    return NextResponse.json({ message: "Membro removido" })
  } catch (error) {
    console.error("Erro ao remover membro:", error)
    return NextResponse.json({ error: "Erro ao remover membro" }, { status: 500 })
  }
}
