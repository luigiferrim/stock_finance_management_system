import { type NextRequest, NextResponse } from "next/server"

import { hashToken } from "@/lib/auth/tokens"
import {
  isOrganizationSchemaNotReadyError,
  organizationSchemaNotReadyResponse,
} from "@/lib/organizations/context"
import { getInvitePreviewByTokenHash } from "@/lib/organizations/invites-repository"

export const dynamic = "force-dynamic"

// GET /api/invites/preview?token=... — dados públicos (gated pelo token) de um
// convite pendente, usados pela tela de cadastro para mostrar a organização e
// travar o e-mail no endereço convidado. Não exige sessão: o token só chega a
// quem recebeu o convite.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? ""

  if (token.length < 10) {
    return NextResponse.json({ error: "Convite inválido" }, { status: 400 })
  }

  try {
    const preview = await getInvitePreviewByTokenHash(hashToken(token))

    if (!preview || preview.status !== "pending" || preview.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Convite inválido ou expirado" }, { status: 404 })
    }

    return NextResponse.json({
      email: preview.email,
      role: preview.role,
      organizationName: preview.organizationName,
    })
  } catch (error) {
    if (isOrganizationSchemaNotReadyError(error)) {
      return organizationSchemaNotReadyResponse()
    }

    console.error("Erro ao carregar convite:", error)
    return NextResponse.json({ error: "Erro ao carregar convite" }, { status: 500 })
  }
}
