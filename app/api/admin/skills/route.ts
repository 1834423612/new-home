import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const rows = await query("SELECT * FROM skills ORDER BY category, sort_order ASC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const { id, name, icon, category, sort_order } = body

    if (id) {
      await query(
        "UPDATE skills SET name=?, icon=?, category=?, sort_order=? WHERE id=?",
        [name, icon, category, sort_order || 0, id]
      )
    } else {
      await query(
        "INSERT INTO skills (name, icon, category, sort_order) VALUES (?, ?, ?, ?)",
        [name, icon, category, sort_order || 0]
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving skill:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await req.json()
    await query("DELETE FROM skills WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting skill:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
