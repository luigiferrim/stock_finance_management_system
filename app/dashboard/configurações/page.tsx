"use client"

import { FormEvent, useState } from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormMessage {
  type: "success" | "error"
  text: string
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "A nova senha precisa ter pelo menos 8 caracteres."
  }

  if (!/[A-Z]/.test(password)) {
    return "A nova senha precisa ter ao menos uma letra maiúscula."
  }

  if (!/[a-z]/.test(password)) {
    return "A nova senha precisa ter ao menos uma letra minúscula."
  }

  if (!/\d/.test(password)) {
    return "A nova senha precisa ter ao menos um número."
  }

  return null
}

export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<FormMessage | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    const passwordError = validatePassword(newPassword)

    if (passwordError) {
      setMessage({ type: "error", text: passwordError })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "A confirmação da senha não confere." })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data: { error?: string; message?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível alterar a senha.")
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage({ type: "success", text: data.message ?? "Senha alterada com sucesso." })
    } catch (submitError) {
      setMessage({
        type: "error",
        text: submitError instanceof Error ? submitError.message : "Erro ao alterar a senha.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie os dados da conta e a segurança do acesso.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Informações vinculadas à conta autenticada</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={session?.user.name ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={session?.user.email ?? ""} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Use uma senha com 8 ou mais caracteres, incluindo letras e números</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {message ? (
                <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {message.text}
                </p>
              ) : null}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
