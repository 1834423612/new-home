import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { query } from "@/lib/db"

// Returns both sites and tools as a unified list with a "table" field
export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const siteRows = await query<Record<string, unknown>[]>("SELECT *, 'site' as `table` FROM sites ORDER BY sort_order ASC")
    const toolRows = await query<Record<string, unknown>[]>("SELECT *, 'tool' as `table` FROM tools ORDER BY sort_order ASC")
    return NextResponse.json([...siteRows, ...toolRows])
  } catch (error) {
    console.error("Error fetching sites/tools:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const data = await request.json()
    const table = data.type === "tool" ? "tools" : "sites"

    if (table === "sites") {
      await query(
        `INSERT INTO sites (id, title_zh, title_en, description_zh, description_en, url, icon, since, tags, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title_zh=VALUES(title_zh), title_en=VALUES(title_en), description_zh=VALUES(description_zh), description_en=VALUES(description_en), url=VALUES(url), icon=VALUES(icon), since=VALUES(since), tags=VALUES(tags), sort_order=VALUES(sort_order)`,
        [data.id, data.title_zh, data.title_en, data.description_zh || "", data.description_en || "", data.url || "#", data.icon || null, data.since || null, JSON.stringify(data.tags || []), data.sort_order || 0]
      )
    } else {
      await query(
        `INSERT INTO tools (id, title_zh, title_en, description_zh, description_en, url, icon, tags, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title_zh=VALUES(title_zh), title_en=VALUES(title_en), description_zh=VALUES(description_zh), description_en=VALUES(description_en), url=VALUES(url), icon=VALUES(icon), tags=VALUES(tags), sort_order=VALUES(sort_order)`,
        [data.id, data.title_zh, data.title_en, data.description_zh || "", data.description_en || "", data.url || "#", data.icon || null, JSON.stringify(data.tags || []), data.sort_order || 0]
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving site/tool:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id, type } = await request.json()
    const table = type === "tool" ? "tools" : "sites"
    await query(`DELETE FROM \`${table}\` WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
