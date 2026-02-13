import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
    try {
        const rows = await query("SELECT * FROM social_links ORDER BY sort_order ASC, id ASC")
        return NextResponse.json(rows)
    } catch (error) {
        console.error("Error fetching social links:", error)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const body = await req.json()
        const { id, name, icon, url, link_type, text_content, color, sort_order, visible } = body

        if (id) {
            await query(
                `UPDATE social_links SET name=?, icon=?, url=?, link_type=?, text_content=?, color=?, sort_order=?, visible=? WHERE id=?`,
                [name, icon, url || null, link_type || "link", text_content || null, color || "#ffffff", sort_order || 0, visible !== false ? 1 : 0, id]
            )
        } else {
            await query(
                `INSERT INTO social_links (name, icon, url, link_type, text_content, color, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, icon, url || null, link_type || "link", text_content || null, color || "#ffffff", sort_order || 0, visible !== false ? 1 : 0]
            )
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error saving social link:", error)
        return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const { id } = await req.json()
        await query("DELETE FROM social_links WHERE id = ?", [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting social link:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
