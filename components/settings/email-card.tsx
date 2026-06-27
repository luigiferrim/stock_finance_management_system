"use client"

import { type FormEvent, useState } from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EmailCard() {
  const { data: session } = useSession()
  const [newEmail, setNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setConfirmUrl(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/user/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, currentPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Erro ao solicitar troca.")
        return
      }
      setConfirmUrl(data.confirmUrl)
      setNewEmail("")
      setCurrentPassword("")
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-mail</CardTitle>
        <CardDescription>E-mail atual: {session?.user?.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">Novo e-mail</Label>
            <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Solicitando..." : "Solicitar troca de e-mail"}
          </Button>
        </form>
        {confirmUrl && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#6e5a4b]">Abra este link (logado) para confirmar a troca:</p>
            <div className="flex gap-2">
              <Input readOnly value={confirmUrl} />
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(confirmUrl)}>Copiar</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
