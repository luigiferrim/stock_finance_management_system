import { getServerSession } from "next-auth"
import { Coffee } from "lucide-react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { authOptions } from "@/lib/auth/options"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-white p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Coffee className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Area autenticada</h1>
            <p className="text-muted-foreground">
              Auth integrada. O dashboard completo entra em outra fase sem conflitar com esta base.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">Sessao atual</p>
          <p className="text-lg font-semibold text-foreground">{session?.user?.name ?? "Usuario"}</p>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>

        <div className="mt-8 flex justify-end">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
