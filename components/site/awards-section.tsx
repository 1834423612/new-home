"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"
import { trackAwardClick, trackViewMore } from "@/lib/umami"

const PREVIEW_COUNT = 3

export function AwardsSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { awards } = useSiteData()

  const displayed = awards.slice(0, PREVIEW_COUNT)
  const hasMore = awards.length > PREVIEW_COUNT

  if (awards.length === 0) return null

  return (
    <section id="awards" className="relative px-6 py-24 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-5xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">03</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.awards.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-8 text-center font-mono text-sm text-muted-foreground">
          {dict.awards.subtitle}
        </p>

        <div className="flex flex-col gap-4">
          {displayed.map((award, i) => (
            <Link
              key={award.id}
              href={`/awards/${award.slug}`}
              onClick={() => trackAwardClick(award.slug, award.title[locale])}
              className="group flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-all duration-400 hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.06)] hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon icon="mdi:trophy-outline" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {award.title[locale]}
                  </h3>
                  {award.level && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-secondary-foreground">
                      {award.level}
                    </span>
                  )}
                </div>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground/60">
                  {award.org[locale]} / {award.date}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {award.description[locale]}
                </p>
                {award.officialLinks && award.officialLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {award.officialLinks.map((link) => (
                      <span
                        key={link.url}
                        className="flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] font-mono text-primary"
                      >
                        <Icon icon="mdi:link-variant" className="h-3 w-3" />
                        {link.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Icon icon="mdi:chevron-right" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-1" />
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/awards"
              onClick={() => trackViewMore("awards", "/awards")}
              className="group flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-mono text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              {dict.awards.viewMore}
              <Icon icon="mdi:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
