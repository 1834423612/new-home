import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { listR2Objects, uploadToR2, deleteFromR2 } from "@/lib/r2"

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const prefix = request.nextUrl.searchParams.get("prefix") || ""
    const objects = await listR2Objects(prefix, 200)
    return NextResponse.json(objects)
  } catch (error) {
    console.error("R2 list error:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || "bin"
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const key = `${folder}/${timestamp}-${safeName}`

    const url = await uploadToR2(key, buffer, file.type || `application/${ext}`)
    return NextResponse.json({ url, key })
  } catch (error) {
    console.error("R2 upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { key } = await request.json()
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 })
    await deleteFromR2(key)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("R2 delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
