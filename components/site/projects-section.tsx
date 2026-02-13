"use client"

import { useState } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"

const PREVIEW_COUNT = 6
const categoryKeys = ["all", "website", "tool", "game", "design", "contribution"] as const

export function ProjectsSection() {
  const { dict, locale } = useLocale()
  const { projects } = useSiteData()
  const { ref, isInView } = useInView()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory)

  const displayed = filtered.slice(0, PREVIEW_COUNT)
  const hasMore = filtered.length > PREVIEW_COUNT

  return (
    <section id="projects" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-5xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">02</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.projects.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-8 text-center font-mono text-sm text-muted-foreground">
          {dict.projects.subtitle}
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((project, i) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-500",
                "hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)]",
                hoveredId && hoveredId !== project.id && "opacity-50"
              )}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="relative h-40 overflow-hidden bg-secondary">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title[locale]}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon="mdi:folder-open-outline"
                      className="h-12 w-12 text-muted-foreground/20 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-background/10 px-2 py-0.5 text-[10px] font-mono text-foreground backdrop-blur-[2px]">
                      {tag}
                    </span>
                  ))}
                </div>
                {project.featured && (
                  <span className="absolute right-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-mono text-primary-foreground">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="mb-1 font-bold text-foreground group-hover:text-primary transition-colors">
                  {project.title[locale]}
                </h3>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground/60">{project.date}</p>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {project.description[locale]}
                </p>
                <span className="flex items-center gap-1.5 text-xs font-mono text-primary">
                  {dict.projects.viewDetail}
                  <Icon icon="mdi:arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/projects"
              className="group flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-mono text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              {dict.projects.viewMore}
              <Icon icon="mdi:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
