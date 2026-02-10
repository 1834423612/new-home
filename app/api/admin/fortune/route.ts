import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const rows = await query<Record<string, unknown>[]>("SELECT * FROM fortune_tags ORDER BY id ASC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching fortune_tags:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const data = await request.json()
    if (data.id) {
      await query("UPDATE fortune_tags SET text_zh = ?, text_en = ? WHERE id = ?", [data.text_zh, data.text_en, data.id])
    } else {
      await query("INSERT INTO fortune_tags (text_zh, text_en) VALUES (?, ?)", [data.text_zh, data.text_en])
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving fortune_tag:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await request.json()
    await query("DELETE FROM fortune_tags WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
