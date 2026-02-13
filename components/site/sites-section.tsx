"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"

const PREVIEW_SITES = 4
const PREVIEW_TOOLS = 4

export function SitesSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { sites, tools } = useSiteData()

  const displayedSites = sites.slice(0, PREVIEW_SITES)
  const displayedTools = tools.slice(0, PREVIEW_TOOLS)
  const hasMore = sites.length > PREVIEW_SITES || tools.length > PREVIEW_TOOLS

  return (
    <section className="relative px-6 py-24 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-5xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        <div className="mb-10 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">06</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-xl font-bold md:text-2xl">{dict.sites.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Personal Sites */}
        <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-primary">{dict.sites.personalSites}</h3>
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayedSites.map((site) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.06)] hover:-translate-y-1"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {site.title[locale]}
                </h4>
                <Icon icon="mdi:arrow-top-right" className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
              </div>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {site.description[locale]}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {dict.common.since} {site.since}
                </span>
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
        {displayedTools.length > 0 && (
          <>
            <h3 className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-primary">{dict.sites.tools}</h3>
            <p className="mb-4 text-xs text-muted-foreground">{dict.sites.toolsSubtitle}</p>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {displayedTools.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon icon={tool.icon || "mdi:wrench-outline"} className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {tool.title[locale]}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{tool.description[locale]}</p>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {hasMore && (
          <div className="flex justify-center">
            <Link
              href="/sites"
              className="group flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-mono text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              {dict.sites.viewMore}
              <Icon icon="mdi:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
