import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

type NormalizedProjectLink = {
  id?: string
  title_zh: string
  title_en: string
  url: string
  icon?: string
}

function normalizeProjectLinks(input: unknown): NormalizedProjectLink[] {
  const toArray = (value: unknown): unknown[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) return parsed
        if (typeof parsed === "string") {
          try {
            const parsedTwice = JSON.parse(parsed)
            if (Array.isArray(parsedTwice)) return parsedTwice
            if (parsedTwice && typeof parsedTwice === "object") return [parsedTwice]
          } catch {
            return []
          }
        }
        if (parsed && typeof parsed === "object") return [parsed]
      } catch {
        return []
      }
      return []
    }
    if (value && typeof value === "object") {
      const candidate = value as Record<string, unknown>
      if ("url" in candidate || "title" in candidate || "title_zh" in candidate || "title_en" in candidate) {
        return [candidate]
      }
      return Object.values(candidate).filter((entry) => !!entry)
    }
    return []
  }

  const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "")

  return toArray(input)
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const candidate = item as Record<string, unknown>
      const titleObj = candidate.title && typeof candidate.title === "object"
        ? (candidate.title as Record<string, unknown>)
        : undefined

      const url = asText(candidate.url)
      if (!url) return null

      const title_zh = asText(candidate.title_zh) || asText(titleObj?.zh) || asText(candidate.title) || asText(candidate.label)
      const title_en = asText(candidate.title_en) || asText(titleObj?.en) || asText(candidate.title) || asText(candidate.label)
      const id = asText(candidate.id)
      const icon = asText(candidate.icon) || asText(candidate.icon_url) || asText(candidate.iconUrl)

      return {
        ...(id ? { id } : {}),
        title_zh,
        title_en,
        url,
        ...(icon ? { icon } : {}),
      }
    })
    .filter((link): link is NormalizedProjectLink => !!link)
}

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

    const normalizedLinks = normalizeProjectLinks(links_json ?? body.links)

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
        detail_zh || "", detail_en || "", JSON.stringify(normalizedLinks),
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

