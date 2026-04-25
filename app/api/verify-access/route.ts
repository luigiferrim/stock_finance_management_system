import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { applyRateLimit } from "@/lib/rate-limit"
import { getDb } from "@/lib/db"
import { validateEnvOrThrow } from "@/lib/env-check"

const rateLimiter = applyRateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

    try {
      await rateLimiter.check(3, ip)
    } catch {
      const sql = getDb()
      await sql`
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (
          ${Number.parseInt(session.user.id)},
          'security_alert',
          ${"Múltiplas tentativas de código de acesso falhadas do IP: " + ip},
          NOW()
        )
      `

      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 1 hora antes de tentar novamente." },
        { status: 429 },
      )
    }

    const { accessCode } = await req.json()

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json({ error: "Código de acesso é obrigatório" }, { status: 400 })
    }

    let masterCode: string
    try {
      masterCode = validateEnvOrThrow("MASTER_ACCESS_CODE")
    } catch {
      return NextResponse.json({ error: "Sistema de verificação não configurado corretamente" }, { status: 500 })
    }

    const isValid = timingSafeEqual(Buffer.from(accessCode.trim()), Buffer.from(masterCode))

    const sql = getDb()

    if (!isValid) {
      await sql`
        INSERT INTO logs (user_id, action, details, created_at)
        VALUES (
          ${Number.parseInt(session.user.id)},
          'access_denied',
          ${"Tentativa de acesso com código incorreto do IP: " + ip},
          NOW()
        )
      `

      return NextResponse.json({ error: "Código de acesso incorreto" }, { status: 403 })
    }

    await sql`
      INSERT INTO logs (user_id, action, details, created_at)
      VALUES (
        ${Number.parseInt(session.user.id)},
        'access_granted',
        'Acesso ao sistema concedido com código mestre',
        NOW()
      )
    `

    const response = NextResponse.json({
      success: true,
      message: "Acesso concedido",
    })

    response.cookies.set("access_verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}
