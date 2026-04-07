import { getServerSession } from "next-auth"
import { Coffee } from "lucide-react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { authOptions } from "@/lib/auth/options"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Olá, {session?.user?.name?.split(' ')[0] ?? "Usuário"} 👋
          </h1>
          <p className="text-sm text-gray-500">
            Bem-vindo ao painel de gestão da Caferri.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#8B6F47]">
            <Coffee className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Área Autenticada</h2>
            <p className="text-sm text-gray-500">
              Auth integrada. O dashboard completo entra em outra fase sem conflitar com esta base.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl bg-gray-50 p-4 border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sessão Atual</p>
            <p className="text-base font-semibold text-gray-900 mt-1">{session?.user?.name ?? "Usuário"}</p>
            <p className="text-sm text-gray-600">{session?.user?.email}</p>
          </div>
          <div className="shrink-0">
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="h-72 rounded-xl border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mt-8">
        <span className="text-gray-400">[ Espaço reservado para os Gráficos e Cards Estatísticos ]</span>
      </div>
    </div>
  )
}