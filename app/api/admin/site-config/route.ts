import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const rows = await query<{ key: string; value: string }[]>(
      "SELECT `key`, `value` FROM site_config"
    )
    const config: Record<string, string> = {}
    for (const row of rows) {
      config[row.key] = row.value
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching site config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const entries = Object.entries(body) as [string, string][]

    for (const [key, value] of entries) {
      await query(
        "INSERT INTO site_config (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
        [key, value]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site config:", error)
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
