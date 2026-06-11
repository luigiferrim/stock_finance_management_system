type HeaderValue = string | string[] | undefined
type HeaderBag = Headers | Record<string, HeaderValue> | undefined

// Vercel preview/branch deploys live on ephemeral hostnames that are gated by
// Deployment Protection (the "login with Vercel" wall). A public link built from
// one of these will never open for an external recipient. We detect them so the
// caller can fall back to a stable domain and we can warn during diagnosis.
function isEphemeralVercelHost(hostname: string): boolean {
  if (!/\.vercel\.app$/i.test(hostname)) {
    return false
  }
  // Production alias is a clean <project>.vercel.app. Preview/branch/commit
  // deploys carry an extra "-git-<branch>" or "-<deploymentHash>" segment, e.g.
  //   stockfee-git-main-acme.vercel.app  (branch)
  //   stockfee-abc123def-acme.vercel.app (commit)
  // Those are the ones gated by Deployment Protection.
  return /-git-/i.test(hostname) || /-[a-z0-9]{8,}-[a-z0-9-]+\.vercel\.app$/i.test(hostname)
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

// Resolves the base URL used to build public links (e.g. invite links) that are
// opened by people outside the app. Prefers NEXT_PUBLIC_SITE_URL (the stable
// production domain) and falls back to the request origin, warning when that
// origin is an ephemeral Vercel host that would hit Deployment Protection.
export function resolvePublicBaseUrl(requestUrl: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    return stripTrailingSlash(configured)
  }

  const parsed = new URL(requestUrl)
  if (isEphemeralVercelHost(parsed.hostname)) {
    console.warn(
      `[resolvePublicBaseUrl] Gerando link público a partir de um domínio de preview da Vercel (${parsed.hostname}). ` +
        "Esse link provavelmente cairá na tela de autenticação da Vercel. " +
        "Defina NEXT_PUBLIC_SITE_URL com o domínio de produção.",
    )
  }

  return stripTrailingSlash(parsed.origin)
}

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
