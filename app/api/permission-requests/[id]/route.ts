import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { requirePermission } from "@/lib/organizations/context"
import { requireSameOrigin } from "@/lib/security/api"
import {
  getRequestById,
  updateRequestStatus,
} from "@/lib/organizations/permission-requests-repository"
import { findMembershipByUserId, updateMemberRole } from "@/lib/organizations/members-repository"
import { validatePositiveInteger } from "@/lib/security/validation"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    const originError = requireSameOrigin(request)
    if (originError) {
      return originError
    }

    const context = await requirePermission(session, "org:view-settings")
    if (!context.ok) {
      return context.response
    }

    const { id } = await params
    const requestId = validatePositiveInteger(id, "Solicitação")
    if (!requestId.valid) {
      return NextResponse.json({ error: "ID de solicitação inválido." }, { status: 400 })
    }

    const body = (await request.json()) as { action?: string }
    const { action } = body

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Ação inválida. Use 'approve' ou 'reject'." }, { status: 400 })
    }

    const permRequest = await getRequestById(context.organization.id, requestId.value)
    if (!permRequest) {
      return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 })
    }

    if (permRequest.status !== "pending") {
      return NextResponse.json({ error: "Esta solicitação já foi revisada." }, { status: 409 })
    }

    if (action === "approve") {
      const membership = await findMembershipByUserId(
        context.organization.id,
        permRequest.requesterUserId,
      )

      if (!membership) {
        return NextResponse.json(
          { error: "O solicitante não é mais um membro ativo da organização." },
          { status: 409 },
        )
      }

      await updateMemberRole(context.organization.id, membership.id, permRequest.requestedRole)
      await updateRequestStatus(context.organization.id, requestId.value, "approved", context.userId)

      return NextResponse.json({
        message: `Solicitação aprovada. O papel foi atualizado para ${permRequest.requestedRole}.`,
      })
    }

    await updateRequestStatus(context.organization.id, requestId.value, "rejected", context.userId)

    return NextResponse.json({ message: "Solicitação rejeitada." })
  } catch (error) {
    console.error("Erro ao revisar solicitação de permissão:", error)
    return NextResponse.json({ error: "Erro ao revisar solicitação" }, { status: 500 })
  }
}
