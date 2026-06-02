import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { canAssignRole, canManageMember, parseRole } from "@/lib/auth/permissions"
import { getDb } from "@/lib/db"
import { requirePermission } from "@/lib/organizations/context"
import { countActiveOwners, getMembershipById, updateMemberRole } from "@/lib/organizations/members-repository"
import { parseJsonBody, requireSameOrigin } from "@/lib/security/api"
import { validatePositiveInteger } from "@/lib/security/validation"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    const originError = requireSameOrigin(request)
    if (originError) return originError

    const context = await requirePermission(session, "member:change-role")
    if (!context.ok) return context.response

    const memberId = validatePositiveInteger(id, "Membro")
    if (!memberId.valid) return NextResponse.json({ error: memberId.error }, { status: 400 })

    const body = await parseJsonBody<{ role?: unknown }>(request)
    if (!body.ok) return body.response

    const newRole = parseRole(body.data.role)
    if (!newRole) return NextResponse.json({ error: "Papel inválido" }, { status: 400 })

    const target = await getMembershipById(context.organization.id, memberId.value)
    if (!target || !target.active) return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })

    const targetRole = parseRole(target.role)
    if (!targetRole) return NextResponse.json({ error: "Membro com papel inválido" }, { status: 409 })

    // Privilege rules.
    if (!canManageMember(context.role, targetRole) || !canAssignRole(context.role, newRole)) {
      return NextResponse.json({ error: "Você não pode alterar este papel" }, { status: 403 })
    }

    // Never demote the last Owner.
    if (targetRole === "Owner" && newRole !== "Owner") {
      const owners = await countActiveOwners(context.organization.id)
      if (owners <= 1) {
        return NextResponse.json({ error: "A organização precisa de ao menos um Owner" }, { status: 409 })
      }
    }

    await updateMemberRole(context.organization.id, memberId.value, newRole)

    const sql = getDb()
    await sql`
      INSERT INTO logs (user_id, organization_id, action, details, created_at)
      VALUES (
        ${context.userId}, ${context.organization.id}, 'change_role',
        ${`Papel do membro #${memberId.value} alterado de ${targetRole} para ${newRole}`}, NOW()
      )
    `

    return NextResponse.json({ message: "Papel atualizado", role: newRole })
  } catch (error) {
    console.error("Erro ao alterar papel:", error)
    return NextResponse.json({ error: "Erro ao alterar papel" }, { status: 500 })
  }
}
