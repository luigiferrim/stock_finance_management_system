import Link from "next/link"
import { Coffee } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary">
            <Coffee className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stockfee</h1>
            <p className="mt-1 text-muted-foreground">Gerenciamento inteligente de café para cafeterias e torrefadoras.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button size="lg" className="w-full">
              Entrar
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button size="lg" variant="outline" className="w-full bg-transparent">
              Criar conta
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
