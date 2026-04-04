type HeaderValue = string | string[] | undefined
type HeaderBag = Headers | Record<string, HeaderValue> | undefined

export function getClientIp(headers: HeaderBag): string {
  if (!headers) {
    return "unknown"
  }

  const forwardedFor = getHeaderValue(headers, "x-forwarded-for")
  const realIp = getHeaderValue(headers, "x-real-ip")
  const candidate = forwardedFor?.split(",")[0]?.trim() || realIp?.trim()

  return candidate || "unknown"
}

function getHeaderValue(headers: HeaderBag, key: string): string | undefined {
  if (!headers) {
    return undefined
  }

  if (headers instanceof Headers) {
    return headers.get(key) ?? undefined
  }

  const headerValue = headers[key] ?? headers[key.toLowerCase()]

  if (Array.isArray(headerValue)) {
    return headerValue[0]
  }

  return headerValue
}
