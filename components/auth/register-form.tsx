"use client"

import type React from "react"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { Suspense, useState } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function RegisterFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const [name, setName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("A senha deve conter pelo menos uma letra e um número")
      return
    }

    if (organizationName.trim().length < 2) {
      setError("Informe o nome da organização")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, organizationName, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao registrar")
        setLoading(false)
        return
      }

      const loginUrl = callbackUrl
        ? `/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/login?registered=true"
      router.push(loginUrl)
    } catch {
      setError("Erro ao registrar. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Crie sua conta" description="Comece a organizar os lotes da sua torrefaria no Stockfee.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Insira seu nome completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={loading}
              className="bg-white pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization-name">Organização</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="organization-name"
              type="text"
              placeholder="Nome da torrefação ou empresa"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              required
              disabled={loading}
              maxLength={100}
              className="bg-white pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Insira seu endereço de e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              className="bg-white pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Criar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha segura"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              minLength={8}
              maxLength={128}
              className="bg-white pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
          <input
            id="terms"
            type="checkbox"
            required
            disabled={loading}
            className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label htmlFor="terms">
            Li e concordo com a{" "}
            <Link href="/politica-de-privacidade" className="font-medium text-primary underline underline-offset-4">
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link href="/termos-de-uso" className="font-medium text-primary underline underline-offset-4">
              Termos de Uso
            </Link>
            .
          </label>
        </div>

        <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Já tem uma conta? </span>
          <Link
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
            className="font-medium text-primary underline underline-offset-4"
          >
            Fazer login
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}

export function RegisterForm() {
  return (
    <Suspense fallback={null}>
      <RegisterFormInner />
    </Suspense>
  )
}
