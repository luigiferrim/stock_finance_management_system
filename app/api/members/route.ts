import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { requirePermission } from "@/lib/organizations/context"
import { listMembers } from "@/lib/organizations/members-repository"
import { listPendingInvites } from "@/lib/organizations/invites-repository"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const context = await requirePermission(session, "member:list")
    if (!context.ok) {
      return context.response
    }

    const [members, invites] = await Promise.all([
      listMembers(context.organization.id),
      listPendingInvites(context.organization.id),
    ])

    return NextResponse.json({
      currentUserId: context.userId,
      currentRole: context.role,
      members,
      invites,
    })
  } catch (error) {
    console.error("Erro ao listar membros:", error)
    return NextResponse.json({ error: "Erro ao listar membros" }, { status: 500 })
  }
}
