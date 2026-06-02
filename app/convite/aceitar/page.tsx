"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

function AcceptInviteInner() {
  const params = useSearchParams()
  const router = useRouter()
  const { status, update } = useSession()
  const token = params.get("token") ?? ""
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = `/convite/aceitar?token=${encodeURIComponent(token)}`

  useEffect(() => {
    if (status !== "authenticated" || !token) return
    void (async () => {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível aceitar o convite.")
        return
      }
      setMessage("Convite aceito! Redirecionando…")
      await update({ organizationId: String(data.organizationId), role: data.role })
      router.push("/dashboard/dashboard")
    })()
  }, [status, token, router, update])

  if (!token) return <p className="p-8 text-center">Convite inválido.</p>

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md p-8 text-center space-y-4">
        <h1 className="text-lg font-bold text-[#2b221c]">Você foi convidado para uma organização</h1>
        <p className="text-sm text-[#6e5a4b]">Entre ou crie uma conta com o e-mail convidado para aceitar.</p>
        <div className="flex justify-center gap-3">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="rounded-lg bg-[#795548] px-4 py-2 text-sm text-white">Entrar</Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="rounded-lg border px-4 py-2 text-sm">Criar conta</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md p-8 text-center space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : <p className="text-sm text-[#6e5a4b]">{message ?? "Processando convite…"}</p>}
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Carregando…</p>}>
      <AcceptInviteInner />
    </Suspense>
  )
}
