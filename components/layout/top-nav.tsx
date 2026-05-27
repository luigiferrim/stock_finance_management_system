"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, TrendingUp, History, Settings, LogOut, Bell, Menu, X } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { StockfeeLogo } from "@/components/icons/stockfee-logo"

const navItems = [
  { href: "/dashboard/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/estoque", label: "Estoque", icon: Package },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/dashboard/historico", label: "Histórico", icon: History },
  { href: "/dashboard/configurações", label: "Configurações", icon: Settings },
]

export function TopNav() {
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/dashboard"
    }
    return pathname.startsWith(href)
  }

  const firstName =
    sessionStatus === "authenticated" && session?.user?.name
      ? session.user.name.split(" ")[0]
      : null
  const initials =
    sessionStatus === "authenticated" && session?.user?.name
      ? session.user.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e6e0d9] bg-[#faf8f5]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard/dashboard" className="flex items-center gap-2.5 shrink-0 mr-2">
          <div className="w-9 h-9 bg-[#795548] rounded-xl flex items-center justify-center">
            <StockfeeLogo className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[#2b221c] text-base hidden sm:block">Stockfee</span>
        </Link>

        {/* Pill nav — desktop */}
        <nav className="hidden md:flex items-center bg-[#ece7df] rounded-full p-1 gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive(href)
                  ? "bg-white text-[#2b221c] shadow-sm"
                  : "text-[#6e5a4b] hover:text-[#2b221c] hover:bg-white/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Notificações"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6e5a4b] hover:bg-[#ece7df] transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
          </button>

          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-[#795548] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials ?? ""}
            </div>
            {firstName && (
              <div className="hidden lg:block leading-tight">
                <p className="text-sm font-semibold text-[#2b221c]">{firstName}</p>
                <p className="text-xs text-[#6e5a4b]">Admin</p>
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sair"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6e5a4b] hover:bg-[#ece7df] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#6e5a4b] hover:bg-[#ece7df] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e6e0d9] bg-[#faf8f5] px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-[#795548]/10 text-[#795548]"
                  : "text-[#6e5a4b] hover:bg-[#ece7df] hover:text-[#2b221c]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-[#e6e0d9]">
            <button
              onClick={() => {
                setMobileOpen(false)
                signOut({ callbackUrl: "/login" })
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#6e5a4b] hover:bg-[#ece7df]"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
