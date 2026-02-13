"use client"

import { useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"
import { useSiteConfig } from "@/hooks/use-site-config"
import { trackEmailClick, trackSocialClick, trackCopyAction } from "@/lib/umami"

export function ContactSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { socialLinks } = useSiteData()
  const { config } = useSiteConfig()
  const c = (key: string, fallback: string) => config[`${key}_${locale}`] || config[key] || fallback
  const contactEmail = config.contact_email || dict.contact.emailAddress

  // Filter to only visible links
  const visibleLinks = socialLinks.filter((link) => link.visible !== false)

  return (
    <section id="contact" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-3xl text-center transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">08</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.contact.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-2 flex justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={512}
            height={512}
            className="h-24 w-24 rounded-2xl object-contain sm:h-32 sm:w-32 md:h-40 md:w-40"
            priority={false}
          />
        </div>

        <p className="mb-6 font-mono text-sm text-muted-foreground">
          {c("contact_subtitle", dict.contact.subtitle)}
        </p>

        {/* Email */}
        <a
          href={`mailto:${contactEmail}`}
          onClick={() => trackEmailClick(contactEmail)}
          className="group mb-10 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
          data-umami-event="email-click"
          data-umami-event-email={contactEmail}
        >
          <Icon icon="mdi:email-outline" className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm text-foreground">{contactEmail}</span>
          <Icon
            icon="mdi:arrow-top-right"
            className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        {/* Social grid */}
        <div className="flex flex-wrap justify-center gap-3">
          {visibleLinks.map((link) =>
            link.linkType === "text" ? (
              <TextContactButton key={link.name} link={link} />
            ) : (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocialClick(link.name, link.url)}
                className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-all duration-300 hover:border-transparent hover:-translate-y-0.5"
                style={{ ["--social-color" as string]: link.color }}
                data-umami-event="social-click"
                data-umami-event-platform={link.name}
              >
                <Icon
                  icon={link.icon}
                  className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-[var(--social-color)]"
                />
                <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                  {link.name}
                </span>
              </a>
            )
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Text-type contact (e.g., WeChat) — click to show content with copy ─── */
function TextContactButton({ link }: { link: { name: string; icon: string; color: string; textContent?: string } }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!link.textContent) return
    try {
      await navigator.clipboard.writeText(link.textContent)
      setCopied(true)
      trackCopyAction(link.name, link.textContent)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); trackSocialClick(link.name, "text-contact") }}
        className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-all duration-300 hover:border-transparent hover:-translate-y-0.5"
        style={{ ["--social-color" as string]: link.color }}
        data-umami-event="social-click"
        data-umami-event-platform={link.name}
      >
        <Icon
          icon={link.icon}
          className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-[var(--social-color)]"
        />
        <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          {link.name}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* Backdrop */}
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
              {/* Arrow */}
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
