"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { GlobalToolbar } from "@/components/site/global-toolbar"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 9
const categoryKeys = ["all", "website", "tool", "game", "design", "contribution"] as const

export default function ProjectsPage() {
  const { dict, locale } = useLocale()
  const { projects } = useSiteData()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() =>
    activeCategory === "all" ? projects : projects.filter((p) => p.category === activeCategory),
    [activeCategory]
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-background">
      <GlobalToolbar />
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12">
        {/* Back nav */}
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          {dict.projects.backToList}
        </Link>

        <h1 className="mb-2 text-3xl font-bold md:text-4xl">{dict.projects.allProjects}</h1>
        <p className="mb-8 font-mono text-sm text-muted-foreground">{dict.projects.subtitle}</p>

        {/* Category filter */}
        <div className="mb-10 flex flex-wrap gap-2">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-mono transition-all duration-300",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {dict.projects.categories[cat as keyof typeof dict.projects.categories]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)]"
            >
              <div className="relative h-36 overflow-hidden bg-secondary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon icon="mdi:folder-open-outline" className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-mono text-foreground backdrop-blur-sm">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">{project.title[locale]}</h3>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground/60">{project.date}</p>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{project.description[locale]}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
            >
              <Icon icon="mdi:chevron-left" className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs transition-all",
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
            >
              <Icon icon="mdi:chevron-right" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
