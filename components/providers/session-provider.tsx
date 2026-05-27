"use client"

import type React from "react"
import type { Session } from "next-auth"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: Session | null
}) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}
