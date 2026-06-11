import { describe, expect, it } from "vitest"

import { generateToken, hashToken } from "@/lib/auth/tokens"

describe("tokens", () => {
  it("generates a long urlsafe token", () => {
    const token = generateToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]{40,}$/)
  })
  it("generates unique tokens", () => {
    expect(generateToken()).not.toBe(generateToken())
  })
  it("hash is deterministic and 64 hex chars", () => {
    const token = "abc"
    expect(hashToken(token)).toBe(hashToken(token))
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/)
  })
  it("different tokens hash differently", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"))
  })
})
