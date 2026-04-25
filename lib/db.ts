import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getDb() {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL or NEON_DATABASE_URL environment variable is required")
    }
    _sql = neon(connectionString)
  }
  return _sql
}

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const db = getDb()
  return db(strings, ...values)
}
