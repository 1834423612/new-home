"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { GlobalToolbar } from "@/components/site/global-toolbar"

export default function SitesPage() {
  const { dict, locale } = useLocale()
  const { sites, tools } = useSiteData()

  return (
    <main className="min-h-screen bg-background">
      <GlobalToolbar />
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          {dict.sites.backToHome}
        </Link>

        <h1 className="mb-2 text-3xl font-bold md:text-4xl">{dict.sites.allSites}</h1>
        <p className="mb-10 font-mono text-sm text-muted-foreground">{dict.sites.subtitle}</p>

        {/* Personal Sites */}
        <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-primary">{dict.sites.personalSites}</h2>
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{site.title[locale]}</h3>
                <Icon icon="mdi:arrow-top-right" className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
              </div>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{site.description[locale]}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground/60">{dict.common.since} {site.since}</span>
                <div className="flex gap-1">
                  {site.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-mono text-secondary-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Toolbox */}
        <h2 className="mb-1 font-mono text-sm font-bold uppercase tracking-widest text-primary">{dict.sites.tools}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{dict.sites.toolsSubtitle}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
                <Icon icon={tool.icon || "mdi:wrench-outline"} className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tool.title[locale]}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{tool.description[locale]}</p>
                <div className="mt-2 flex gap-1">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-mono text-secondary-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
