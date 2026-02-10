import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  const pool = getPool()
  const [rows] = await pool.query("SELECT * FROM awards ORDER BY sort_order ASC, date DESC")
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  const pool = getPool()
  const data = await request.json()

  if (data.id) {
    await pool.query(
      `INSERT INTO awards (id, slug, title_zh, title_en, description_zh, description_en, detail_zh, detail_en, org_zh, org_en, date, level, image, official_links, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE slug=VALUES(slug), title_zh=VALUES(title_zh), title_en=VALUES(title_en), description_zh=VALUES(description_zh), description_en=VALUES(description_en), detail_zh=VALUES(detail_zh), detail_en=VALUES(detail_en), org_zh=VALUES(org_zh), org_en=VALUES(org_en), date=VALUES(date), level=VALUES(level), image=VALUES(image), official_links=VALUES(official_links), sort_order=VALUES(sort_order)`,
      [
        data.id, data.slug || data.id, data.title_zh, data.title_en,
        data.description_zh, data.description_en, data.detail_zh || "",
        data.detail_en || "", data.org_zh, data.org_en, data.date,
        data.level || null, data.image || null,
        JSON.stringify(data.official_links || []), data.sort_order || 0,
      ]
    )
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const authError = await requireAuth()
  if (authError) return authError
  const pool = getPool()
  const { id } = await request.json()
  await pool.query("DELETE FROM awards WHERE id = ?", [id])
  return NextResponse.json({ success: true })
}
