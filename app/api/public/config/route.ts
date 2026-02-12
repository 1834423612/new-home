import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await query<{ key: string; value: string }[]>(
      "SELECT `key`, `value` FROM site_config"
    )
    const config: Record<string, string> = {}
    for (const row of rows) {
      config[row.key] = row.value
    }
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({})
  }
}
