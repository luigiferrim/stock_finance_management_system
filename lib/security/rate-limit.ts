type RateLimitOptions = {
  maxAttempts: number
  windowMs: number
}

type RateLimitRecord = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function createRateLimiter({ maxAttempts, windowMs }: RateLimitOptions) {
  const store = new Map<string, RateLimitRecord>()

  return {
    check(key: string): RateLimitResult {
      const now = Date.now()
      const current = store.get(key)

      if (!current || now > current.resetAt) {
        const nextRecord = {
          count: 1,
          resetAt: now + windowMs,
        }

        store.set(key, nextRecord)
        return {
          allowed: true,
          remaining: maxAttempts - 1,
          resetAt: nextRecord.resetAt,
        }
      }

      if (current.count >= maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: current.resetAt,
        }
      }

      current.count += 1

      return {
        allowed: true,
        remaining: maxAttempts - current.count,
        resetAt: current.resetAt,
      }
    },
  }
}
