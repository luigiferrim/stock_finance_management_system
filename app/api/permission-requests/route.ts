import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { isKnownRole, ROLES } from "@/lib/auth/permissions"
import { requireActiveOrganization, requirePermission } from "@/lib/organizations/context"
import { requireSameOrigin } from "@/lib/security/api"
import {
  createPermissionRequest,
  findPendingRequestForUser,
  listAllRequests,
} from "@/lib/organizations/permission-requests-repository"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const context = await requirePermission(session, "org:view-settings")
    if (!context.ok) {
      return context.response
    }

    const requests = await listAllRequests(context.organization.id)
    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Erro ao listar solicitações de permissão:", error)
    return NextResponse.json({ error: "Erro ao listar solicitações" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const context = await requireActiveOrganization(session)
    if (!context.ok) {
      return context.response
    }

    const body = (await request.json()) as { requestedRole?: string; reason?: string }
    const { requestedRole, reason } = body

    if (!requestedRole || !isKnownRole(requestedRole)) {
      return NextResponse.json({ error: "Papel solicitado inválido." }, { status: 400 })
    }

    const currentRole = context.organization.role
    const currentRoleIndex = ROLES.indexOf(currentRole as (typeof ROLES)[number])
    const requestedRoleIndex = ROLES.indexOf(requestedRole as (typeof ROLES)[number])

    if (requestedRoleIndex <= currentRoleIndex) {
      return NextResponse.json(
        { error: "Você só pode solicitar um papel com mais permissões que o atual." },
        { status: 400 },
      )
    }

    const existing = await findPendingRequestForUser(context.organization.id, context.userId)
    if (existing) {
      return NextResponse.json(
        { error: "Você já tem uma solicitação pendente. Aguarde a revisão." },
        { status: 409 },
      )
    }

    const trimmedReason = reason?.trim() || null

    await createPermissionRequest(
      context.organization.id,
      context.userId,
      requestedRole,
      trimmedReason,
    )

    return NextResponse.json({ message: "Solicitação enviada com sucesso." }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar solicitação de permissão:", error)
    return NextResponse.json({ error: "Erro ao criar solicitação" }, { status: 500 })
  }
}
