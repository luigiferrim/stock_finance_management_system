import type { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  requireActiveOrganization: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  sql: vi.fn(),
}))

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}))

vi.mock("@/lib/auth/options", () => ({
  authOptions: {},
}))

vi.mock("@/lib/organizations/context", () => ({
  requireActiveOrganization: mocks.requireActiveOrganization,
}))

vi.mock("@/lib/auth/password", () => ({
  verifyPassword: mocks.verifyPassword,
  hashPassword: mocks.hashPassword,
}))

vi.mock("@/lib/db", () => ({
  getDb: () => mocks.sql,
}))

function createRequest() {
  return new Request("https://stockfee.test/api/user/change-password", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "stockfee.test",
      origin: "https://stockfee.test",
    },
    body: JSON.stringify({
      currentPassword: "wrong-current-password",
      newPassword: "ValidPassword123!",
    }),
  }) as NextRequest
}

async function importPostHandler() {
  vi.resetModules()
  const route = await import("./route")

  return route.POST
}

beforeEach(() => {
  vi.clearAllMocks()

  mocks.sql.mockImplementation(async (strings: TemplateStringsArray) => {
    const query = strings.join("")

    if (query.includes("SELECT id, password FROM users")) {
      return [{ id: 10, password: "stored-password" }]
    }

    return []
  })
  mocks.getServerSession.mockResolvedValue({
    user: {
      id: "user-1",
      email: "user@example.com",
    },
  })
  mocks.requireActiveOrganization.mockResolvedValue({
    ok: true,
    organization: {
      id: 20,
    },
  })
  mocks.verifyPassword.mockResolvedValue({ valid: false })
  mocks.hashPassword.mockResolvedValue("new-password-hash")
})

describe("POST /api/user/change-password", () => {
  it("returns 429 on the sixth authenticated attempt for the same user", async () => {
    const POST = await importPostHandler()

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(createRequest())

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({ error: "Senha atual incorreta" })
    }

    const response = await POST(createRequest())

    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toMatch(/^\d+$/)
    await expect(response.json()).resolves.toEqual({
      error: "Muitas tentativas de troca de senha. Tente novamente mais tarde.",
    })
  })

  it("keeps rate limits isolated by session user id", async () => {
    const POST = await importPostHandler()

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(createRequest())
      expect(response.status).toBe(400)
    }

    mocks.getServerSession.mockResolvedValue({
      user: {
        id: "user-2",
        email: "other@example.com",
      },
    })

    const response = await POST(createRequest())

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: "Senha atual incorreta" })
  })

  it("does not consume the limit for unauthenticated requests", async () => {
    const POST = await importPostHandler()

    mocks.getServerSession.mockResolvedValue(null)

    for (let index = 0; index < 6; index += 1) {
      const response = await POST(createRequest())

      expect(response.status).toBe(401)
      await expect(response.json()).resolves.toEqual({ error: "Não autenticado" })
    }

    mocks.getServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
    })

    const response = await POST(createRequest())

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: "Senha atual incorreta" })
  })

  it("does not check the password after the user is rate limited", async () => {
    const POST = await importPostHandler()

    for (let index = 0; index < 5; index += 1) {
      await POST(createRequest())
    }

    mocks.verifyPassword.mockClear()

    const response = await POST(createRequest())

    expect(response.status).toBe(429)
    expect(mocks.verifyPassword).not.toHaveBeenCalled()
  })
})
