"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ErrorState } from "@/components/ui/error-state"
import { ListSkeleton } from "@/components/skeletons/list-skeleton"
import { ROLES, type Role, can, canAssignRole, canManageMember } from "@/lib/auth/permissions"
import { useRole } from "@/lib/auth/use-permissions"

interface Member {
  id: number
  userId: number
  name: string
  email: string
  role: string
  joinedAt: string
}

interface PendingInvite {
  id: number
  email: string
  role: string
  expiresAt: string
  createdAt: string
}

interface MembersResponse {
  currentUserId: number
  currentRole: string
  members: Member[]
  invites: PendingInvite[]
}

const badgeClass =
  "inline-flex items-center rounded-full bg-[#ece7df] px-2.5 py-0.5 text-xs font-medium text-[#6e5a4b]"

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function MembersSection() {
  const currentRole = useRole()

  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [error, setError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("Viewer")
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [acceptUrl, setAcceptUrl] = useState("")

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/members", { cache: "no-store" })
      const data = (await response.json()) as MembersResponse & { error?: string }

      if (!response.ok) {
        setLoadError(true)
        return
      }

      setCurrentUserId(data.currentUserId)
      setMembers(data.members)
      setInvites(data.invites)
      setLoadError(false)
      setError("")
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const retryLoad = useCallback(() => {
    setLoading(true)
    void load()
  }, [load])

  if (!currentRole || !canManageMember(currentRole, "Viewer")) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>Gerencie os papéis e o acesso da sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">Carregando os membros…</span>
            <ListSkeleton rows={3} />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>Gerencie os papéis e o acesso da sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState
            variant="section"
            title="Não foi possível carregar os membros."
            message="Tente novamente."
            onRetry={retryLoad}
          />
        </CardContent>
      </Card>
    )
  }

  async function handleRoleChange(memberId: number, role: string) {
    try {
      const response = await fetch(`/api/members/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? "Não foi possível alterar o papel.")
      } else {
        setError("")
      }
    } catch {
      setError("Erro ao alterar o papel.")
    } finally {
      await load()
    }
  }

  async function handleRemoveMember(memberId: number) {
    try {
      const response = await fetch(`/api/members/${memberId}`, { method: "DELETE" })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? "Não foi possível remover o membro.")
      } else {
        setError("")
      }
    } catch {
      setError("Erro ao remover o membro.")
    } finally {
      await load()
    }
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAcceptUrl("")

    try {
      setInviteSubmitting(true)

      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })

      const data = (await response.json()) as { error?: string; acceptUrl?: string }

      if (!response.ok) {
        setError(data.error ?? "Não foi possível enviar o convite.")
        return
      }

      setError("")
      setInviteEmail("")
      setAcceptUrl(data.acceptUrl ?? "")
      await load()
    } catch {
      setError("Erro ao enviar o convite.")
    } finally {
      setInviteSubmitting(false)
    }
  }

  async function handleRevokeInvite(inviteId: number) {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, { method: "DELETE" })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? "Não foi possível revogar o convite.")
      } else {
        setError("")
      }
    } catch {
      setError("Erro ao revogar o convite.")
    } finally {
      await load()
    }
  }

  const assignableRoles = ROLES.filter((r) => canAssignRole(currentRole, r))
  const invitableRoles = assignableRoles.filter((r) => r !== "Owner")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros</CardTitle>
        <CardDescription>Gerencie os papéis e o acesso da sua organização.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="space-y-2">
          {members.map((member) => {
            const memberRole = member.role as Role
            const editable =
              canManageMember(currentRole, memberRole) && member.userId !== currentUserId

            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e6e0d9] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#2b221c]">{member.name}</p>
                  <p className="truncate text-xs text-[#6e5a4b]">{member.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  {editable ? (
                    <>
                      <select
                        defaultValue={member.role}
                        onChange={(event) => handleRoleChange(member.id, event.target.value)}
                        className="h-9 rounded-md border border-[#e6e0d9] bg-transparent px-2 text-sm text-[#2b221c] outline-none"
                      >
                        {ROLES.filter((r) => canAssignRole(currentRole, r)).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remover
                      </Button>
                    </>
                  ) : (
                    <span className={badgeClass}>{member.role}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {can(currentRole, "member:invite") ? (
          <div className="space-y-3 border-t border-[#e6e0d9] pt-6">
            <h3 className="text-sm font-semibold text-[#2b221c]">Convidar membro</h3>
            <form className="flex flex-wrap items-end gap-3" onSubmit={handleInvite}>
              <div className="flex-1 space-y-1" style={{ minWidth: "12rem" }}>
                <label htmlFor="invite-email" className="text-xs font-medium text-[#6e5a4b]">
                  E-mail
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="pessoa@empresa.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="invite-role" className="text-xs font-medium text-[#6e5a4b]">
                  Papel
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as Role)}
                  className="h-12 rounded-md border border-[#e6e0d9] bg-transparent px-2 text-sm text-[#2b221c] outline-none"
                >
                  {invitableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? "Enviando..." : "Convidar"}
              </Button>
            </form>

            {acceptUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input readOnly value={acceptUrl} className="flex-1" style={{ minWidth: "12rem" }} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(acceptUrl)}
                >
                  Copiar
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3 border-t border-[#e6e0d9] pt-6">
          <h3 className="text-sm font-semibold text-[#2b221c]">Convites pendentes</h3>
          {invites.length === 0 ? (
            <p className="text-sm text-[#6e5a4b]">Nenhum convite pendente.</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e6e0d9] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#2b221c]">{invite.email}</p>
                    <p className="truncate text-xs text-[#6e5a4b]">
                      <span className={badgeClass}>{invite.role}</span>
                      <span className="ml-2">expira em {formatDate(invite.expiresAt)}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeInvite(invite.id)}
                  >
                    Revogar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
