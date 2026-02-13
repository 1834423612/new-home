"use client"

import useSWR from "swr"
import {
  projects as localProjects,
  experiences as localExperiences,
  skills as localSkills,
  sites as localSites,
  awards as localAwards,
  tools as localTools,
  socialLinks as localSocialLinks,
  games as localGames,
  type Project,
  type Experience,
  type Skill,
  type Site,
  type Award,
  type Tool,
  type SocialLink,
  type Game,
} from "@/lib/data"

interface FortuneTag { zh: string; en: string }

export interface FooterSponsor {
  id: number
  name: string
  logo?: string
  url?: string
}

interface SiteData {
  projects: Project[]
  experiences: Experience[]
  skills: Skill[]
  sites: Site[]
  awards: Award[]
  tools: Tool[]
  socialLinks: SocialLink[]
  fortuneTags: FortuneTag[]
  games: Game[]
  footerSponsors: FooterSponsor[]
  source: "database" | "local"
}

const fetcher = async (url: string): Promise<SiteData> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("DB fetch failed")
  const data = await res.json()
  if (data.source === "error") throw new Error("DB unavailable")
  return { ...data, source: "database" }
}

const fallback: SiteData = {
  projects: localProjects,
  experiences: localExperiences,
  skills: localSkills,
  sites: localSites,
  awards: localAwards,
  tools: localTools,
  socialLinks: localSocialLinks,
  fortuneTags: [],
  games: localGames,
  footerSponsors: [],
  source: "local",
}

export function useSiteData(): SiteData & { isLoading: boolean } {
  const { data, isLoading } = useSWR<SiteData>("/api/public/data", fetcher, {
    fallbackData: fallback,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    errorRetryCount: 1,
    onError: () => {
      // Silently fall back to local data
    },
  })

  return {
    ...(data || fallback),
    isLoading,
  }
}
