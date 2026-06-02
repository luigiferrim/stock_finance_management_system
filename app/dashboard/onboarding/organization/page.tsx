"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OrganizationResponse = {
  organization?: {
    id: string
    name: string
    role: string
  }
  error?: string
}

export default function OrganizationOnboardingPage() {
  const router = useRouter()
  const { data: session, update, status } = useSession()
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session.user.organizationId) {
      router.replace("/dashboard/dashboard")
    }
  }, [router, session?.user.organizationId, status])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      setError("Informe um nome com pelo menos 2 caracteres.")
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      })

      const data: OrganizationResponse = await response.json()

      if (!response.ok || !data.organization) {
        throw new Error(data.error ?? "Não foi possível criar a organização.")
      }

      await update({
        organizationId: data.organization.id,
        organizationName: data.organization.name,
        role: data.organization.role,
      })

      router.replace("/dashboard/dashboard")
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao criar organização.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#795548] text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Crie sua organização</CardTitle>
            <CardDescription>Ela será usada para separar lotes, financeiro e histórico da sua conta.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="organization-name">Nome da organização</Label>
              <Input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Torrefação Central"
                maxLength={100}
                required
                disabled={submitting}
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Criando..." : "Criar organização"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
