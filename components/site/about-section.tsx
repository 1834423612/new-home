"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"
import { useSiteConfig } from "@/hooks/use-site-config"

export function AboutSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { socialLinks } = useSiteData()
  const { config } = useSiteConfig()
  const c = (key: string, fallback: string) => config[`${key}_${locale}`] || config[key] || fallback

  // Filter to only visible links
  const visibleLinks = socialLinks.filter((link) => link.visible !== false)

  const bioParagraphs = config[`about_bio_${locale}`]
    ? config[`about_bio_${locale}`].split("\n").filter(Boolean)
    : dict.about.bio

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
                {/* Option 1 - Using profile picture */}
                <img src="https://r2.fastbirdcdn.online/kjch-site/avatars/1770917734977-hdImg_e82ea227498f88935cbc74e33dc40a861530868435913.jpg" alt="Profile" className="h-12 w-12 rounded-full object-cover" />
                {/* Option 2 - Using initials with colored background */}
                {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="font-mono text-lg font-bold">{dict.hero.alias.charAt(0).toUpperCase()}</span>
                </div> */}
                <div>
                  <p className="font-bold text-foreground">{c("hero_name", dict.hero.name)}</p>
                  <p className="font-mono text-xs text-muted-foreground">@{config.hero_alias || dict.hero.alias}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:map-marker-outline" className="h-4 w-4 text-primary" />
                  <span>{c("about_location", dict.about.profile.location)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:school-outline" className="h-4 w-4 text-primary" />
                  <span>{c("about_school", dict.about.profile.school)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:email-outline" className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs">{config.about_email || dict.about.profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:web" className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs">{config.about_website || dict.about.profile.website}</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="mt-6 flex flex-wrap gap-2">
                {visibleLinks.map((link) =>
                  link.linkType === "text" ? (
                    <AboutTextContact key={link.name} link={link} />
                  ) : (
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
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right: Bio text */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {/* Motto */}
            <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
              <p>{c("about_motto", dict.about.motto)}</p>
              <p className="mt-1">{c("about_motto2", dict.about.motto2)}</p>
            </blockquote>

            {/* Bio paragraphs */}
            <div className="flex flex-col gap-4 leading-relaxed text-foreground/80">
              {bioParagraphs.map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Makesome.cool badge */}
            {/* <a
              href="https://makesome.cool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-mono text-secondary-foreground transition-colors hover:border-primary"
            >
              <Icon icon="mdi:link-variant" className="h-3.5 w-3.5" />
              {config.about_badge || dict.about.profile.badge}
            </a> */}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Text-type contact for About card (e.g., WeChat) ─── */
function AboutTextContact({ link }: { link: { name: string; icon: string; color: string; textContent?: string } }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!link.textContent) return
    try {
      await navigator.clipboard.writeText(link.textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
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
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="whitespace-nowrap rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
              <div className="flex items-center gap-3">
                <Icon icon={link.icon} className="h-4 w-4 shrink-0" style={{ color: link.color }} />
                <span className="font-mono text-sm text-foreground">{link.textContent || "—"}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy() }}
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} className="h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="absolute left-1/2 top-full -translate-x-1/2">
                <div className="h-2 w-2 rotate-45 border-b border-r border-border bg-card" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
