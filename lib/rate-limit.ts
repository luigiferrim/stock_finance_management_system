type RateLimitStore = Map<string, { count: number; resetTime: number }>

const stores = new Map<string, RateLimitStore>()

interface RateLimitConfig {
  interval: number
  maxRequests: number
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now()

  if (!stores.has(identifier)) {
    stores.set(identifier, new Map())
  }

  const store = stores.get(identifier)!
  const key = identifier
  const record = store.get(key)

  if (!record || now > record.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.interval,
    })
    return true
  }

  if (record.count >= config.maxRequests) {
    return false
  }

  record.count++
  return true
}

export function applyRateLimit(config: { interval: number; uniqueTokenPerInterval: number }) {
  const store = new Map<string, { count: number; resetTime: number }>()

  return {
    check: async (limit: number, token: string): Promise<void> => {
      const now = Date.now()
      const record = store.get(token)

      if (!record || now > record.resetTime) {
        store.set(token, {
          count: 1,
          resetTime: now + config.interval,
        })
        return
      }

      if (record.count >= limit) {
        throw new Error("Rate limit exceeded")
      }

      record.count++
    },
  }
}

setInterval(() => {
  const now = Date.now()
  stores.forEach((store) => {
    store.forEach((record, key) => {
      if (now > record.resetTime) {
        store.delete(key)
      }
    })
  })
}, 60000)
