import { neon } from "@neondatabase/serverless"

type DbClient = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>

let _sql: DbClient | null = null

export function getDb(): DbClient {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL or NEON_DATABASE_URL environment variable is required")
    }
    _sql = neon(connectionString) as DbClient
  }
  return _sql
}

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const db = getDb()
  return db(strings, ...values)
}
