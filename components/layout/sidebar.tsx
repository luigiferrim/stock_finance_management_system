"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, TrendingUp, History, Settings, LogOut, X } from "lucide-react"
import { signOut } from "next-auth/react"

import { StockfeeLogo } from "@/components/icons/stockfee-logo"
import type { Action } from "@/lib/auth/permissions"
import { can } from "@/lib/auth/permissions"
import { useRole } from "@/lib/auth/use-permissions"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const role = useRole()

  const navItems: { href: string; label: string; icon: typeof LayoutDashboard; action: Action }[] = [
    { href: "/dashboard/dashboard", label: "Dashboard", icon: LayoutDashboard, action: "dashboard:view" },
    { href: "/dashboard/estoque", label: "Controle de Estoque", icon: Package, action: "stock:view" },
    { href: "/dashboard/financeiro", label: "Análise Financeira", icon: TrendingUp, action: "financials:view" },
    { href: "/dashboard/historico", label: "Histórico e Alertas", icon: History, action: "history:view-domain" },
  ]

  const visibleNavItems = navItems.filter((item) => can(role, item.action))

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {isOpen && onClose && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`
          w-64 h-screen bg-[#2b221c] text-white flex flex-col fixed left-0 top-0 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B6F47] rounded-lg flex items-center justify-center">
              <StockfeeLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base">Stockfee</h1>
              <p className="text-xs text-white/60">Painel de Gestão</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href) ? "bg-[#8B6F47] text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            href="/dashboard/configuracoes"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive("/dashboard/configuracoes")
                ? "bg-[#8B6F47] text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
