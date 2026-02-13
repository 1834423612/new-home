import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const rows = await query<Record<string, unknown>[]>("SELECT * FROM games ORDER BY sort_order ASC")
        return NextResponse.json(rows)
    } catch (error) {
        console.error("Error fetching games:", error)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const data = await request.json()
        await query(
            `INSERT INTO games (id, title_zh, title_en, icon, hours_played, max_level, account_name, show_account, url, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE title_zh=VALUES(title_zh), title_en=VALUES(title_en), icon=VALUES(icon), hours_played=VALUES(hours_played), max_level=VALUES(max_level), account_name=VALUES(account_name), show_account=VALUES(show_account), url=VALUES(url), sort_order=VALUES(sort_order)`,
            [
                data.id, data.title_zh, data.title_en,
                data.icon || null, data.hours_played || null, data.max_level || null,
                data.account_name || null, data.show_account ? 1 : 0,
                data.url || null, data.sort_order || 0,
            ]
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error saving game:", error)
        return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const authError = await requireAuth()
    if (authError) return authError
    try {
        const { id } = await request.json()
        await query("DELETE FROM games WHERE id = ?", [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting game:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
