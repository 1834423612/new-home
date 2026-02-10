"use client"

import { use } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { GlobalToolbar } from "@/components/site/global-toolbar"

export default function AwardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { dict, locale } = useLocale()
  const { awards } = useSiteData()

  const award = awards.find((a) => a.slug === slug)

  if (!award) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-muted-foreground">Award not found</p>
          <Link href="/awards" className="text-sm font-mono text-primary hover:underline">{dict.awards.backToList}</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <GlobalToolbar />
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <Link href="/awards" className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          {dict.awards.backToList}
        </Link>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon icon="mdi:trophy-outline" className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{award.title[locale]}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="font-mono text-sm text-muted-foreground">{award.org[locale]} / {award.date}</p>
              {award.level && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-mono text-secondary-foreground">{award.level}</span>}
            </div>
          </div>
        </div>

        <div className="mb-8 text-base leading-relaxed text-foreground/80">
          <p>{award.description[locale]}</p>
          {award.detail && <p className="mt-4">{award.detail[locale]}</p>}
        </div>

        {/* Official Links */}
        {award.officialLinks && award.officialLinks.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold text-foreground">
              <Icon icon="mdi:link-variant" className="h-4 w-4 text-primary" />
              {dict.awards.relatedLinks}
            </h3>
            <div className="flex flex-col gap-3">
              {award.officialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:newspaper-variant-outline" className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{link.title}</span>
                  </div>
                  <Icon icon="mdi:open-in-new" className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
