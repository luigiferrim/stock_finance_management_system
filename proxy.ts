import { default as withAuth } from "next-auth/middleware"
import type { NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const ORGANIZATION_ONBOARDING_PATH = "/dashboard/onboarding/organization"

export default withAuth(
  function proxy(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl
    const organizationId = request.nextauth.token?.organizationId
    const hasOrganization = typeof organizationId === "string" && organizationId.length > 0

    if (!hasOrganization && pathname !== ORGANIZATION_ONBOARDING_PATH) {
      return NextResponse.redirect(new URL(ORGANIZATION_ONBOARDING_PATH, request.url))
    }

    if (hasOrganization && pathname === ORGANIZATION_ONBOARDING_PATH) {
      return NextResponse.redirect(new URL("/dashboard/dashboard", request.url))
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
