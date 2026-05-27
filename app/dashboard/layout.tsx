import type React from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { TopNav } from "@/components/layout/top-nav"
import { SessionProvider } from "@/components/providers/session-provider"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    // se falhar no servidor, o cliente busca a sessão normalmente via /api/auth/session
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="w-full">{children}</main>
      </div>
    </SessionProvider>
  )
}
