"use client"

import { FormEvent, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateName } from "@/lib/auth/validation"

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
  const { data: session, update } = useSession()
  const [profileName, setProfileName] = useState("")
  const [profileMessage, setProfileMessage] = useState<FormMessage | null>(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState<FormMessage | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => {
    setProfileName(session?.user.name ?? "")
  }, [session?.user.name])

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileMessage(null)

    const trimmedName = profileName.trim()

    if (!validateName(trimmedName)) {
      setProfileMessage({ type: "error", text: "Informe um nome com 2 a 100 caracteres." })
      return
    }

    try {
      setProfileSubmitting(true)

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      })

      const data: { error?: string; message?: string; user?: { name: string } } = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível atualizar o nome.")
      }

      const updatedName = data.user?.name ?? trimmedName

      setProfileName(updatedName)
      await update({ user: { name: updatedName } })
      setProfileMessage({ type: "success", text: data.message ?? "Nome atualizado com sucesso." })
    } catch (submitError) {
      setProfileMessage({
        type: "error",
        text: submitError instanceof Error ? submitError.message : "Erro ao atualizar o nome.",
      })
    } finally {
      setProfileSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordMessage(null)

    const passwordError = validatePassword(newPassword)

    if (passwordError) {
      setPasswordMessage({ type: "error", text: passwordError })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "A confirmação da senha não confere." })
      return
    }

    try {
      setPasswordSubmitting(true)

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
      setPasswordMessage({ type: "success", text: data.message ?? "Senha alterada com sucesso." })
    } catch (submitError) {
      setPasswordMessage({
        type: "error",
        text: submitError instanceof Error ? submitError.message : "Erro ao alterar a senha.",
      })
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const currentSessionName = session?.user.name ?? ""
  const isProfileUnchanged = profileName.trim() === currentSessionName

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
          <CardContent>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={session?.user.email ?? ""} disabled />
                </div>
              </div>

              {profileMessage ? (
                <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {profileMessage.text}
                </p>
              ) : null}

              <Button type="submit" disabled={profileSubmitting || isProfileUnchanged}>
                {profileSubmitting ? "Salvando..." : "Salvar nome"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Use uma senha com 8 ou mais caracteres, incluindo letras e números</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
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

              {passwordMessage ? (
                <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {passwordMessage.text}
                </p>
              ) : null}

              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? "Salvando..." : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
