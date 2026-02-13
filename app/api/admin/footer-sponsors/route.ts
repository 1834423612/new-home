import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const rows = await query<Record<string, unknown>[]>(
            "SELECT * FROM footer_sponsors ORDER BY sort_order ASC, id ASC"
        )
        return NextResponse.json(rows)
    } catch (error) {
        console.error("Error fetching footer sponsors:", error)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const data = await request.json()
        if (data.id) {
            await query(
                `UPDATE footer_sponsors SET name=?, logo=?, url=?, sort_order=? WHERE id=?`,
                [data.name, data.logo || null, data.url || null, data.sort_order || 0, data.id]
            )
        } else {
            await query(
                `INSERT INTO footer_sponsors (name, logo, url, sort_order) VALUES (?, ?, ?, ?)`,
                [data.name, data.logo || null, data.url || null, data.sort_order || 0]
            )
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error saving footer sponsor:", error)
        return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const { id } = await request.json()
        await query("DELETE FROM footer_sponsors WHERE id = ?", [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting footer sponsor:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
