import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createAuthLog, findUserByEmail, updateUserPasswordHash } from "@/lib/auth/user-repository"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const email = credentials.email.trim().toLowerCase()
          const user = await findUserByEmail(email)

          if (!user) {
            return null
          }

          const passwordVerification = await verifyPassword(credentials.password, user.password)

          if (!passwordVerification.valid) {
            return null
          }

          if (passwordVerification.needsRehash) {
            const upgradedHash = await hashPassword(credentials.password)

            await updateUserPasswordHash(Number(user.id), upgradedHash)
            await createAuthLog({
              userId: Number(user.id),
              action: "upgrade_password_hash",
              details: "Hash legado de senha migrado para PBKDF2",
            })
          }

          await createAuthLog({
            userId: Number(user.id),
            action: "login",
            details: "Usuario logou via dashboard",
          })

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Erro na autenticacao:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
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
