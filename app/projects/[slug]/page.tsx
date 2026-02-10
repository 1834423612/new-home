"use client"

import { use } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { GlobalToolbar } from "@/components/site/global-toolbar"

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { dict, locale } = useLocale()
  const { projects } = useSiteData()

  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-muted-foreground">Project not found</p>
          <Link href="/projects" className="text-sm font-mono text-primary hover:underline">
            {dict.projects.backToList}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <GlobalToolbar />
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <Link href="/projects" className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          {dict.projects.backToList}
        </Link>

        {/* Hero area */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-secondary">
          <div className="flex h-64 items-center justify-center">
            <Icon icon="mdi:folder-open-outline" className="h-20 w-20 text-muted-foreground/15" />
          </div>
        </div>

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs font-mono text-secondary-foreground">{tag}</span>
          ))}
          {project.featured && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary">Featured</span>
          )}
        </div>

        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{project.title[locale]}</h1>
        <p className="mb-6 font-mono text-sm text-muted-foreground/60">{project.date}</p>

        {/* Description */}
        <div className="mb-8 text-base leading-relaxed text-foreground/80">
          <p>{project.description[locale]}</p>
          {project.detail && (
            <p className="mt-4">{project.detail[locale]}</p>
          )}
        </div>

        {/* Action links */}
        <div className="flex flex-wrap items-center gap-4">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              <Icon icon="mdi:open-in-new" className="h-4 w-4" />
              {dict.projects.viewProject}
            </a>
          )}
          {project.source && (
            <a
              href={project.source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary"
            >
              <Icon icon="mdi:github" className="h-4 w-4" />
              {dict.projects.viewSource}
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
