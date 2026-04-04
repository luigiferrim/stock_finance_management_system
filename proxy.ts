import { default as withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function proxy() {
    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login",
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
