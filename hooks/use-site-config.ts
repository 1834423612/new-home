"use client"

import useSWR from "swr"

export type SiteConfig = Record<string, string>

const fetcher = async (url: string): Promise<SiteConfig> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Config fetch failed")
  return res.json()
}

export function useSiteConfig(): { config: SiteConfig; isLoading: boolean } {
  const { data, isLoading } = useSWR<SiteConfig>("/api/public/config", fetcher, {
    fallbackData: {},
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    errorRetryCount: 1,
  })

  return { config: data || {}, isLoading }
}
