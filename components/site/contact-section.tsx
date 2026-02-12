"use client"

import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"
import { useSiteConfig } from "@/hooks/use-site-config"

export function ContactSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { socialLinks } = useSiteData()
  const { config } = useSiteConfig()
  const c = (key: string, fallback: string) => config[`${key}_${locale}`] || config[key] || fallback
  const contactEmail = config.contact_email || dict.contact.emailAddress

  return (
    <section id="contact" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-3xl text-center transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">07</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.contact.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-10 font-mono text-sm text-muted-foreground">
          {c("contact_subtitle", dict.contact.subtitle)}
        </p>

        {/* Email */}
        <a
          href={`mailto:${contactEmail}`}
          className="group mb-10 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
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
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-all duration-300 hover:border-transparent hover:-translate-y-0.5"
              style={{ ["--social-color" as string]: link.color }}
            >
              <Icon
                icon={link.icon}
                className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-[var(--social-color)]"
              />
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {link.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
