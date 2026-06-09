import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth/options"
import { requireActiveOrganization } from "@/lib/organizations/context"
import { findPendingRequestForUser } from "@/lib/organizations/permission-requests-repository"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const context = await requireActiveOrganization(session)
    if (!context.ok) {
      return context.response
    }

    const pending = await findPendingRequestForUser(context.organization.id, context.userId)
    return NextResponse.json({ pending: pending ?? null })
  } catch (error) {
    console.error("Erro ao buscar solicitação do usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar solicitação" }, { status: 500 })
  }
}
