import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const rows = await query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const {
      id, slug, title_zh, title_en, description_zh, description_en,
      detail_zh, detail_en, links_json,
      category, tags, image, link, source, date, featured, sort_order,
    } = body

    await query(
      `INSERT INTO projects (id, slug, title_zh, title_en, description_zh, description_en, detail_zh, detail_en, links_json, category, tags, image, link, source, date, featured, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       slug=VALUES(slug), title_zh=VALUES(title_zh), title_en=VALUES(title_en),
       description_zh=VALUES(description_zh), description_en=VALUES(description_en),
       detail_zh=VALUES(detail_zh), detail_en=VALUES(detail_en), links_json=VALUES(links_json),
       category=VALUES(category), tags=VALUES(tags), image=VALUES(image),
       link=VALUES(link), source=VALUES(source), date=VALUES(date),
       featured=VALUES(featured), sort_order=VALUES(sort_order)`,
      [
        id, slug || id, title_zh, title_en, description_zh || "", description_en || "",
        detail_zh || "", detail_en || "", links_json || "[]",
        category || "website", JSON.stringify(tags || []), image || null,
        link || null, source || null, date || "", featured ? 1 : 0, sort_order || 0,
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving project:", error)
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await req.json()
    await query("DELETE FROM projects WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

