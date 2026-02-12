import { getPool } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Rate limiting: per device token (in-memory)
const lastSave = new Map<string, number>()
const RATE_LIMIT_MS = 5000

// GET /api/resume-profiles?name=xxx or ?deviceToken=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const name = searchParams.get("name")
  const deviceToken = searchParams.get("deviceToken")

  if (!name && !deviceToken) {
    return NextResponse.json({ error: "name or deviceToken required" }, { status: 400 })
  }

  const pool = getPool()

  if (name) {
    const [rows] = await pool.execute(
      "SELECT * FROM resume_profiles WHERE profile_name = ?",
      [name]
    )
    const arr = rows as any[]
    if (arr.length === 0) return NextResponse.json({ found: false })
    const p = arr[0]
    return NextResponse.json({
      found: true,
      profile: p,
      updatedAt: p.updated_at ? new Date(p.updated_at).getTime() : 0,
    })
  }

  // Load by device token
  const [rows] = await pool.execute(
    "SELECT * FROM resume_profiles WHERE device_token LIKE CONCAT('%', ?, '%') ORDER BY updated_at DESC LIMIT 1",
    [deviceToken]
  )
  const arr = rows as any[]
  if (arr.length === 0) return NextResponse.json({ found: false })
  const p = arr[0]
  return NextResponse.json({
    found: true,
    profile: p,
    updatedAt: p.updated_at ? new Date(p.updated_at).getTime() : 0,
  })
}

// POST /api/resume-profiles
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { profileName, resumeData, layout, palette, showIcons, fontScale, locale, deviceToken, lastSavedTs } = body

  if (!profileName || typeof profileName !== "string" || profileName.trim().length < 2) {
    return NextResponse.json({ error: "Profile name must be at least 2 characters" }, { status: 400 })
  }
  if (!resumeData) {
    return NextResponse.json({ error: "resumeData is required" }, { status: 400 })
  }

  const trimmedName = profileName.trim().substring(0, 100)
  const token = (deviceToken || "").substring(0, 200)

  // Rate limiting
  if (token) {
    const last = lastSave.get(token) || 0
    if (Date.now() - last < RATE_LIMIT_MS) {
      return NextResponse.json({ error: "Too frequent. Please wait a few seconds." }, { status: 429 })
    }
    lastSave.set(token, Date.now())
  }

  const pool = getPool()

  // Check if profile exists
  const [existing] = await pool.execute(
    "SELECT id, device_token, updated_at FROM resume_profiles WHERE profile_name = ?",
    [trimmedName]
  )
  const existingArr = existing as any[]

  if (existingArr.length > 0) {
    const row = existingArr[0]
    const storedTokens = (row.device_token || "").split(",").map((t: string) => t.trim()).filter(Boolean)

    // Multi-device: any device that has been linked can update
    if (token && storedTokens.includes(token)) {
      // Conflict detection: if server data is newer than client's last save
      if (lastSavedTs && row.updated_at) {
        const serverTs = new Date(row.updated_at).getTime()
        if (serverTs > lastSavedTs + 2000) {
          // Server has newer data -- return conflict
          const [freshRows] = await pool.execute("SELECT * FROM resume_profiles WHERE id = ?", [row.id])
          const fresh = (freshRows as any[])[0]
          return NextResponse.json({
            error: "conflict",
            message: "Server has newer data from another device.",
            serverProfile: fresh,
            serverUpdatedAt: serverTs,
          }, { status: 409 })
        }
      }

      await pool.execute(
        `UPDATE resume_profiles 
         SET resume_data = ?, layout = ?, palette = ?, show_icons = ?, font_scale = ?, locale = ?, updated_at = NOW()
         WHERE id = ?`,
        [JSON.stringify(resumeData), layout || "classic", palette || "clean-blue", showIcons !== false, fontScale || 100, locale || "en", row.id]
      )
      return NextResponse.json({ success: true, action: "updated", id: row.id, updatedAt: Date.now() })
    }

    // New device tries to use same name -- name_taken (welcome modal will guide them to load)
    if (!token || !storedTokens.includes(token)) {
      return NextResponse.json({ error: "name_taken", message: "This profile name is already taken." }, { status: 409 })
    }
  }

  // Insert new
  const [result] = await pool.execute(
    `INSERT INTO resume_profiles (profile_name, resume_data, layout, palette, show_icons, font_scale, locale, device_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [trimmedName, JSON.stringify(resumeData), layout || "classic", palette || "clean-blue", showIcons !== false, fontScale || 100, locale || "en", token || null]
  )
  const insertResult = result as any
  return NextResponse.json({ success: true, action: "created", id: insertResult.insertId, updatedAt: Date.now() })
}

// PUT /api/resume-profiles  -- Link a device token to an existing profile (claim from another device)
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { profileName, deviceToken } = body

  if (!profileName || !deviceToken) {
    return NextResponse.json({ error: "profileName and deviceToken required" }, { status: 400 })
  }

  const pool = getPool()
  const [rows] = await pool.execute(
    "SELECT id, device_token FROM resume_profiles WHERE profile_name = ?",
    [profileName.trim()]
  )
  const arr = rows as any[]
  if (arr.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const row = arr[0]
  const storedTokens = (row.device_token || "").split(",").map((t: string) => t.trim()).filter(Boolean)

  if (!storedTokens.includes(deviceToken)) {
    storedTokens.push(deviceToken)
    await pool.execute(
      "UPDATE resume_profiles SET device_token = ? WHERE id = ?",
      [storedTokens.join(","), row.id]
    )
  }

  return NextResponse.json({ success: true, action: "linked" })
}
