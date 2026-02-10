"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { GlobalToolbar } from "@/components/site/global-toolbar"

export default function AwardsPage() {
  const { dict, locale } = useLocale()
  const { awards } = useSiteData()

  return (
    <main className="min-h-screen bg-background">
      <GlobalToolbar />
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          {dict.awards.backToList}
        </Link>

        <h1 className="mb-2 text-3xl font-bold md:text-4xl">{dict.awards.allAwards}</h1>
        <p className="mb-8 font-mono text-sm text-muted-foreground">{dict.awards.subtitle}</p>

        <div className="flex flex-col gap-4">
          {awards.map((award) => (
            <Link
              key={award.id}
              href={`/awards/${award.slug}`}
              className="group flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon icon="mdi:trophy-outline" className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{award.title[locale]}</h3>
                  {award.level && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-secondary-foreground">{award.level}</span>}
                </div>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground/60">{award.org[locale]} / {award.date}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{award.description[locale]}</p>
              </div>
              <Icon icon="mdi:chevron-right" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
