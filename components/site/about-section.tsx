"use client"

import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"

export function AboutSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { socialLinks } = useSiteData()

  return (
    <section id="about" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-4xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        {/* Section label */}
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            01
          </span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.about.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Two column layout */}
        <div className="grid gap-12 md:grid-cols-5">
          {/* Left: Quick info card */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="font-mono text-lg font-bold">{dict.hero.alias.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-bold text-foreground">{dict.hero.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">@{dict.hero.alias}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:map-marker-outline" className="h-4 w-4 text-primary" />
                  <span>{dict.about.profile.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:school-outline" className="h-4 w-4 text-primary" />
                  <span>{dict.about.profile.school}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:email-outline" className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs">{dict.about.profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:web" className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs">{dict.about.profile.website}</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-all duration-300 hover:border-transparent"
                    style={{ ["--social-color" as string]: link.color }}
                    aria-label={link.name}
                  >
                    <Icon
                      icon={link.icon}
                      className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-[var(--social-color)]"
                    />
                    <span
                      className="absolute -bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-4"
                      style={{ backgroundColor: link.color }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bio text */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {/* Motto */}
            <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
              <p>{dict.about.motto}</p>
              <p className="mt-1">{dict.about.motto2}</p>
            </blockquote>

            {/* Bio paragraphs */}
            <div className="flex flex-col gap-4 leading-relaxed text-foreground/80">
              {dict.about.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Makesome.cool badge */}
            <a
              href="https://makesome.cool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-mono text-secondary-foreground transition-colors hover:border-primary"
            >
              <Icon icon="mdi:link-variant" className="h-3.5 w-3.5" />
              {dict.about.profile.badge}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
