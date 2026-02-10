import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getSession } from "@/lib/auth"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rows = await query<{ id: number; username: string; created_at: string }[]>(
      "SELECT id, username, created_at FROM admin_users WHERE id = ?",
      [session.userId]
    )

    if (!rows.length) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { username, currentPassword, newPassword } = body

    // Update username
    if (username && username !== session.username) {
      await query("UPDATE admin_users SET username = ? WHERE id = ?", [username, session.userId])
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }

      const rows = await query<{ password_hash: string }[]>(
        "SELECT password_hash FROM admin_users WHERE id = ?",
        [session.userId]
      )

      if (!rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const valid = await bcrypt.compare(currentPassword, rows[0].password_hash)
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      const hash = await bcrypt.hash(newPassword, 12)
      await query("UPDATE admin_users SET password_hash = ? WHERE id = ?", [hash, session.userId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
