import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [projectRows, experienceRows, skillRows, siteRows, awardRows, toolRows, socialRows, fortuneRows, gameRows, footerSponsorRows] =
      await Promise.all([
        query<Record<string, unknown>[]>("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC"),
        query<Record<string, unknown>[]>("SELECT * FROM experiences ORDER BY sort_order ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM skills ORDER BY sort_order ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM sites ORDER BY sort_order ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM awards ORDER BY sort_order ASC, created_at DESC"),
        query<Record<string, unknown>[]>("SELECT * FROM tools ORDER BY sort_order ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM social_links ORDER BY sort_order ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM fortune_tags ORDER BY id ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM games ORDER BY sort_order ASC"),
        query<Record<string, unknown>[]>("SELECT * FROM footer_sponsors ORDER BY sort_order ASC, id ASC"),
      ])

    const parseTags = (t: unknown): string[] => {
      if (!t) return []
      if (Array.isArray(t)) return t
      if (typeof t === "string") { try { return JSON.parse(t) } catch { return [] } }
      return []
    }

    const parseLinks = (t: unknown): { title: { zh: string; en: string }; url: string; icon?: string }[] => {
      if (!t) return []
      if (Array.isArray(t)) return t
      if (typeof t === "string") { 
        try { 
          const parsed = JSON.parse(t)
          return Array.isArray(parsed) ? parsed : []
        } catch { 
          return [] 
        } 
      }
      return []
    }

    const projects = projectRows.map((r) => ({
      id: r.id, slug: r.slug || r.id,
      title: { zh: r.title_zh, en: r.title_en },
      description: { zh: r.description_zh || "", en: r.description_en || "" },
      detail: { zh: r.detail_zh || "", en: r.detail_en || "" },
      links: parseLinks(r.links_json),
      category: r.category || "website", tags: parseTags(r.tags),
      image: r.image || undefined, link: r.link || undefined,
      source: r.source || undefined, date: r.date || "",
      featured: !!(r.featured),
    }))

    const experiences = experienceRows.map((r) => ({
      id: r.id,
      title: { zh: r.title_zh, en: r.title_en },
      org: { zh: r.org_zh, en: r.org_en },
      description: { zh: r.description_zh || "", en: r.description_en || "" },
      startDate: r.start_date || "", endDate: r.end_date || undefined,
      icon: r.icon || undefined,
    }))

    const skills = skillRows.map((r) => ({
      name: r.name as string, icon: r.icon as string, category: r.category as string,
    }))

    const sites = siteRows.map((r) => ({
      id: r.id,
      title: { zh: r.title_zh, en: r.title_en },
      description: { zh: r.description_zh || "", en: r.description_en || "" },
      url: r.url || "#", since: r.since || "",
      tags: parseTags(r.tags),
    }))

    const awards = awardRows.map((r) => ({
      id: r.id, slug: r.slug || r.id,
      title: { zh: r.title_zh, en: r.title_en },
      description: { zh: r.description_zh || "", en: r.description_en || "" },
      detail: { zh: r.detail_zh || "", en: r.detail_en || "" },
      org: { zh: r.org_zh, en: r.org_en },
      date: r.date || "", level: r.level || undefined,
      image: r.image || undefined,
      officialLinks: parseLinks(r.official_links),
    }))

    const tools = toolRows.map((r) => ({
      id: r.id,
      title: { zh: r.title_zh, en: r.title_en },
      description: { zh: r.description_zh || "", en: r.description_en || "" },
      url: r.url || "#", icon: r.icon || undefined,
      tags: parseTags(r.tags),
      type: (r.type || "tool") as "personal" | "tool",
    }))

    const socialLinks = socialRows.map((r) => ({
      name: r.name as string, icon: r.icon as string,
      url: (r.url || "#") as string, color: (r.color || "#fff") as string,
    }))

    const fortuneTags = fortuneRows.map((r) => ({
      zh: r.text_zh as string, en: r.text_en as string,
    }))

    const games = gameRows.map((r) => ({
      id: r.id,
      title: { zh: r.title_zh, en: r.title_en },
      icon: r.icon || undefined,
      hoursPlayed: r.hours_played || undefined,
      maxLevel: r.max_level || undefined,
      accountName: r.account_name || undefined,
      showAccount: !!(r.show_account),
      url: r.url || undefined,
    }))

    const footerSponsors = footerSponsorRows.map((r) => ({
      id: r.id as number,
      name: r.name as string,
      logo: (r.logo || undefined) as string | undefined,
      url: (r.url || undefined) as string | undefined,
    }))

    return NextResponse.json({
      projects, experiences, skills, sites, awards, tools, socialLinks, fortuneTags, games, footerSponsors,
      source: "database",
    })
  } catch (error) {
    console.error("Failed to fetch data from DB:", error)
    return NextResponse.json({ source: "error", error: "DB unavailable" }, { status: 500 })
  }
}
