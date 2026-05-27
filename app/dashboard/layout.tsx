import type React from "react"
import { TopNav } from "@/components/layout/top-nav"
import { SessionProvider } from "@/components/providers/session-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="w-full">{children}</main>
      </div>
    </SessionProvider>
  )
}
