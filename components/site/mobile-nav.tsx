"use client"

import { useState, useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "hero", icon: "mdi:home-outline" },
  { id: "about", icon: "mdi:account-outline" },
  { id: "projects", icon: "mdi:folder-outline" },
  { id: "skills", icon: "mdi:code-tags" },
  { id: "fortune", icon: "mdi:ticket-outline" },
]

export function MobileNav() {
  const { toggleLocale, locale, dict } = useLocale()
  const { mode, color, setColor, toggleMode, colorOptions } = useTheme()
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState("hero")
  const [showThemes, setShowThemes] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
      const els = navItems.map((n) => ({ id: n.id, el: document.getElementById(n.id) }))
      for (let i = els.length - 1; i >= 0; i--) {
        const el = els[i].el
        if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) { setActive(els[i].id); break }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowThemes(false)
    }
    if (showThemes) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showThemes])

  return (
    <nav className={cn(
      "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1 rounded-full border border-border bg-card/90 px-2 py-1.5 backdrop-blur-md transition-all duration-500 md:hidden",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
    )}>
      {navItems.map((item) => (
        <a key={item.id} href={`#${item.id}`} className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
          active === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )} aria-label={item.id}>
          <Icon icon={item.icon} className="h-4 w-4" />
        </a>
      ))}

      <button onClick={toggleLocale} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground" aria-label={dict.common.toggleLanguage}>
        <span className="text-[10px] font-mono font-bold">{dict.common.langSwitch}</span>
      </button>

      <div className="relative" ref={pickerRef}>
        <button onClick={() => setShowThemes(!showThemes)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground" aria-label={dict.theme.settings}>
          <Icon icon="mdi:palette-outline" className="h-4 w-4" />
        </button>
        {showThemes && (
          <div className="absolute bottom-12 right-0 flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xl min-w-[140px]">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{dict.theme.modeLabel}</span>
              <button onClick={toggleMode} className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs">
                <Icon icon={mode === "dark" ? "mdi:weather-night" : "mdi:weather-sunny"} className="h-3 w-3 text-primary" />
                <span className="font-mono text-[10px] text-foreground">{mode === "dark" ? dict.theme.dark : dict.theme.light}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {colorOptions.map((opt) => (
                <button key={opt.id} onClick={() => setColor(opt.id)} className={cn("flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all", color === opt.id ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: opt.swatch }} title={dict.theme.colors[opt.id as keyof typeof dict.theme.colors] || opt.label}>
                  {color === opt.id && <Icon icon="mdi:check" className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
