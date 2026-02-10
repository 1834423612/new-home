import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const rows = await query("SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching experiences:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const {
      id, title_zh, title_en, org_zh, org_en,
      description_zh, description_en, start_date, end_date, icon, sort_order,
    } = body

    await query(
      `INSERT INTO experiences (id, title_zh, title_en, org_zh, org_en, description_zh, description_en, start_date, end_date, icon, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title_zh=VALUES(title_zh), title_en=VALUES(title_en),
       org_zh=VALUES(org_zh), org_en=VALUES(org_en),
       description_zh=VALUES(description_zh), description_en=VALUES(description_en),
       start_date=VALUES(start_date), end_date=VALUES(end_date),
       icon=VALUES(icon), sort_order=VALUES(sort_order)`,
      [
        id, title_zh, title_en, org_zh, org_en,
        description_zh || "", description_en || "",
        start_date || "", end_date || null, icon || null, sort_order || 0,
      ]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving experience:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await req.json()
    await query("DELETE FROM experiences WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting experience:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
