import { type NextRequest, NextResponse } from "next/server"

type JsonBodyResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      response: NextResponse
    }

export async function parseJsonBody<T = Record<string, unknown>>(request: Request): Promise<JsonBodyResult<T>> {
  try {
    const data = await request.json()

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Dados inválidos" }, { status: 400 }),
      }
    }

    return {
      ok: true,
      data: data as T,
    }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Dados inválidos" }, { status: 400 }),
    }
  }
}

export function requireSameOrigin(request: NextRequest) {
  if (isSameOriginRequest(request)) {
    return null
  }

  return NextResponse.json({ error: "Origem da requisição inválida" }, { status: 403 })
}

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin")
  const host = firstHeaderValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host")

  if (!origin || !host) {
    return false
  }

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase()
  } catch {
    return false
  }
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null
}
