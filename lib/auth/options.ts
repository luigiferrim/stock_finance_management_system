import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createAuthLog, findUserByEmail, updateUserPasswordHash } from "@/lib/auth/user-repository"
import { normalizeEmail, validateEmail, validateName } from "@/lib/auth/validation"
import {
  ORGANIZATION_SCHEMA_NOT_READY_ERROR,
  findActiveOrganizationForUser,
  isOrganizationSchemaNotReadyError,
} from "@/lib/organizations/context"
import { getClientIp } from "@/lib/security/request"
import { createRateLimiter } from "@/lib/security/rate-limit"

const loginRateLimiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const email = normalizeEmail(credentials.email)
          const password = credentials.password

          if (!validateEmail(email)) {
            return null
          }

          if (password.length > 128) {
            return null
          }

          const ip = getClientIp(req.headers)
          const rateLimitResult = loginRateLimiter.check(`login:${ip}:${email}`)

          if (!rateLimitResult.allowed) {
            throw new Error("TooManyAttempts")
          }

          const user = await findUserByEmail(email)

          if (!user) {
            return null
          }

          const passwordVerification = await verifyPassword(password, user.password)

          if (!passwordVerification.valid) {
            return null
          }

          const activeOrganization = await findActiveOrganizationForUser(Number(user.id))

          if (passwordVerification.needsRehash) {
            const upgradedHash = await hashPassword(password)

            await updateUserPasswordHash(Number(user.id), upgradedHash)
            await createAuthLog({
              userId: Number(user.id),
              organizationId: activeOrganization?.id ?? null,
              action: "upgrade_password_hash",
              details: "Hash legado de senha migrado para PBKDF2",
            })
          }

          await createAuthLog({
            userId: Number(user.id),
            organizationId: activeOrganization?.id ?? null,
            action: "login",
            details: "Usuario logou via dashboard",
          })

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            organizationId: activeOrganization?.id.toString() ?? null,
            organizationName: activeOrganization?.name ?? null,
            role: activeOrganization?.role ?? null,
          }
        } catch (error) {
          if (error instanceof Error && error.message === "TooManyAttempts") {
            throw error
          }

          if (isOrganizationSchemaNotReadyError(error)) {
            throw new Error(ORGANIZATION_SCHEMA_NOT_READY_ERROR)
          }

          console.error("Erro na autenticacao:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.organizationId = user.organizationId ?? null
        token.organizationName = user.organizationName ?? null
        token.role = user.role ?? null
      }

      const updatedName = session?.user?.name
      if (trigger === "update" && typeof updatedName === "string") {
        const trimmedName = updatedName.trim()

        if (validateName(trimmedName)) {
          token.name = trimmedName
        }
      }

      if (trigger === "update") {
        const updatePayload = session as
          | {
              organizationId?: unknown
              organizationName?: unknown
              role?: unknown
            }
          | undefined

        if (typeof updatePayload?.organizationId === "string") {
          token.organizationId = updatePayload.organizationId
          token.organizationName =
            typeof updatePayload.organizationName === "string" ? updatePayload.organizationName : null
          token.role = typeof updatePayload.role === "string" ? updatePayload.role : null
        }
      }

      if (typeof token.id === "string" && token.organizationId === undefined) {
        const userId = Number(token.id)

        if (Number.isSafeInteger(userId) && userId > 0) {
          const activeOrganization = await findActiveOrganizationForUser(userId)

          token.organizationId = activeOrganization?.id.toString() ?? null
          token.organizationName = activeOrganization?.name ?? null
          token.role = activeOrganization?.role ?? null
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = typeof token.name === "string" ? token.name : session.user.name
        session.user.email = typeof token.email === "string" ? token.email : session.user.email
        session.user.organizationId = typeof token.organizationId === "string" ? token.organizationId : null
        session.user.organizationName = typeof token.organizationName === "string" ? token.organizationName : null
        session.user.role = typeof token.role === "string" ? token.role : null
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
}
