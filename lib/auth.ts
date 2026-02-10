import { cookies } from "next/headers"

export async function getSession(): Promise<{
  userId: number
  username: string
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    if (!sessionCookie?.value) return null

    const decoded = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    )

    if (decoded.exp < Date.now()) return null

    return { userId: decoded.userId, username: decoded.username }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    const { NextResponse } = await import("next/server")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function requireAuthSession() {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
