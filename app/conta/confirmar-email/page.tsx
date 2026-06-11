"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

function ConfirmEmailInner() {
  const params = useSearchParams()
  const router = useRouter()
  const { status, update } = useSession()
  const token = params.get("token") ?? ""
  const [message, setMessage] = useState("Confirmando…")

  useEffect(() => {
    if (status !== "authenticated" || !token) return
    void (async () => {
      const res = await fetch("/api/user/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) { setMessage(data.error ?? "Não foi possível confirmar."); return }
      await update({ user: { email: data.email } })
      setMessage("E-mail atualizado! Redirecionando…")
      router.push("/dashboard/configuracoes")
    })()
  }, [status, token, router, update])

  if (status === "unauthenticated") return <p className="p-8 text-center">Entre na sua conta para confirmar a troca de e-mail.</p>
  return <p className="p-8 text-center text-sm text-[#6e5a4b]">{message}</p>
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Carregando…</p>}>
      <ConfirmEmailInner />
    </Suspense>
  )
}
