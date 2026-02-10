import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    const host = process.env.DB_HOST
    const user = process.env.DB_USER
    const password = process.env.DB_PASSWORD
    const database = process.env.DB_NAME
    const port = parseInt(process.env.DB_PORT || "3306", 10)

    if (!host || !user || !database) {
      throw new Error(
        "Database environment variables (DB_HOST, DB_USER, DB_NAME) are not set"
      )
    }

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  const pool = getPool()
  const [rows] = await pool.execute(sql, params)
  return rows as T
}
