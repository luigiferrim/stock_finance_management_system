import { getDb } from "@/lib/db/client"

type CreateUserParams = {
  email: string
  name: string
  passwordHash: string
}

type StoredUser = {
  id: number
  email: string
  name: string
  password: string
}

type CreatedUser = {
  id: number
  email: string
  name: string
}

type CreateAuthLogParams = {
  userId: number
  action: string
  details?: string
}

export async function findUserByEmail(email: string) {
  const sql = getDb()
  const users = (await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `) as StoredUser[]

  return users[0] ?? null
}

export async function createUser({ email, name, passwordHash }: CreateUserParams) {
  const sql = getDb()
  const users = (await sql`
    INSERT INTO users (email, password, name)
    VALUES (${email}, ${passwordHash}, ${name})
    RETURNING id, email, name
  `) as CreatedUser[]

  return users[0]
}

export async function createAuthLog({ userId, action, details }: CreateAuthLogParams) {
  const sql = getDb()

  await sql`
    INSERT INTO logs (user_id, action, details, created_at)
    VALUES (${userId}, ${action}, ${details ?? null}, NOW())
  `.catch(() => null)
}

export async function updateUserPasswordHash(userId: number, passwordHash: string) {
  const sql = getDb()

  await sql`
    UPDATE users
    SET password = ${passwordHash}, updated_at = NOW()
    WHERE id = ${userId}
  `
}
