"use client"

import { useState, useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { trackNavClick, trackLanguageToggle, trackThemeChange } from "@/lib/umami"

const sections = [
  { id: "hero", icon: "mdi:home-outline" },
  { id: "about", icon: "mdi:account-outline" },
  { id: "projects", icon: "mdi:folder-outline" },
  { id: "awards", icon: "mdi:trophy-outline" },
  { id: "experience", icon: "mdi:timeline-outline" },
  { id: "skills", icon: "mdi:code-tags" },
  { id: "fortune", icon: "mdi:ticket-outline" },
  { id: "games", icon: "mdi:gamepad-variant-outline" },
  { id: "contact", icon: "mdi:email-outline" },
]

export function SideNav() {
  const { dict, toggleLocale, locale } = useLocale()
  const { mode, color, setColor, toggleMode, colorOptions } = useTheme()
  const [active, setActive] = useState("hero")
  const [visible, setVisible] = useState(false)
  const [themePicker, setThemePicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
      const sectionEls = sections.map((s) => ({ id: s.id, el: document.getElementById(s.id) }))
      for (let i = sectionEls.length - 1; i >= 0; i--) {
        const el = sectionEls[i].el
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 3) { setActive(sectionEls[i].id); break }
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setThemePicker(false)
    }
    if (themePicker) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [themePicker])

  const navLabels: Record<string, string> = {
    hero: "", about: dict.nav.about, projects: dict.nav.projects,
    awards: dict.awards?.title || "Awards", experience: dict.nav.experience,
    skills: dict.nav.skills, fortune: dict.nav.fortune, contact: dict.contact.title,
  }

  return (
    <nav className={cn(
      "fixed right-6 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-3 transition-all duration-500",
      visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none",
      "max-md:hidden"
    )}>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} onClick={() => trackNavClick(s.id, "side-nav")} className="group relative flex items-center" aria-label={navLabels[s.id] || s.id}>
          <span className={cn("absolute right-10 whitespace-nowrap rounded-md px-2 py-1 text-xs font-mono bg-card text-card-foreground border border-border opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0")}>
            {navLabels[s.id] || s.id}
          </span>
          <span className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
            active === s.id ? "border-primary bg-primary text-primary-foreground scale-110" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
          )}>
            <Icon icon={s.icon} className="h-4 w-4" />
          </span>
        </a>
      ))}

      {/* Lang toggle */}
      <button onClick={() => { toggleLocale(); trackLanguageToggle(locale === "zh" ? "en" : "zh") }} className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 text-[10px] font-mono font-bold" aria-label={dict.common.toggleLanguage}>
        {dict.common.langSwitch}
      </button>

      {/* Theme picker */}
      <div className="relative" ref={pickerRef}>
        <button onClick={() => setThemePicker(!themePicker)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300" aria-label={dict.theme.settings}>
          <Icon icon="mdi:palette-outline" className="h-4 w-4" />
        </button>
        {themePicker && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xl min-w-[140px]">
            {/* Mode toggle */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{dict.theme.modeLabel}</span>
              <button onClick={() => { toggleMode(); trackThemeChange("mode", mode === "dark" ? "light" : "dark") }} className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:border-primary">
                <Icon icon={mode === "dark" ? "mdi:weather-night" : "mdi:weather-sunny"} className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[10px] text-foreground">{mode === "dark" ? dict.theme.dark : dict.theme.light}</span>
              </button>
            </div>
            {/* Color swatches */}
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">{dict.theme.colorLabel}</span>
              <div className="flex items-center gap-1.5">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setColor(opt.id); trackThemeChange("color", opt.id) }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110",
                      color === opt.id ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: opt.swatch }}
                    title={dict.theme.colors[opt.id as keyof typeof dict.theme.colors] || opt.label}
                    aria-label={dict.theme.colors[opt.id as keyof typeof dict.theme.colors] || opt.label}
                  >
                    {color === opt.id && <Icon icon="mdi:check" className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resume */}
      <a href="/resume" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300" aria-label={dict.nav.resume} data-umami-event="nav-resume-click">
        <Icon icon="mdi:file-document-outline" className="h-4 w-4" />
      </a>
    </nav>
  )
}
