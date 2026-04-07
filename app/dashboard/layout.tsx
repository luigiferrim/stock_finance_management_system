"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { SessionProvider } from "@/components/providers/session-provider"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 w-full">
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h2 className="font-semibold text-lg text-foreground">Caferri</h2>
          </div>

          {children}
        </main>
      </div>
    </SessionProvider>
  )
}