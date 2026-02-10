"use client"

import { useState, useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

export function GlobalToolbar() {
  const { toggleLocale, locale } = useLocale()
  const { mode, color, setColor, toggleMode, colorOptions } = useTheme()
  const [showThemes, setShowThemes] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowThemes(false)
    }
    if (showThemes) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showThemes])

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <button onClick={toggleLocale} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 backdrop-blur-md text-[10px] font-mono font-bold" aria-label="Toggle language">
        {locale === "zh" ? "EN" : "ZH"}
      </button>

      <div className="relative" ref={pickerRef}>
        <button onClick={() => setShowThemes(!showThemes)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 backdrop-blur-md" aria-label="Theme">
          <Icon icon="mdi:palette-outline" className="h-4 w-4" />
        </button>
        {showThemes && (
          <div className="absolute right-0 top-11 flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xl min-w-[140px]">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Mode</span>
              <button onClick={toggleMode} className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:border-primary">
                <Icon icon={mode === "dark" ? "mdi:weather-night" : "mdi:weather-sunny"} className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[10px] text-foreground">{mode === "dark" ? "Dark" : "Light"}</span>
              </button>
            </div>
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">Color</span>
              <div className="flex items-center gap-1.5">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setColor(opt.id)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110",
                      color === opt.id ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: opt.swatch }}
                    title={opt.label}
                    aria-label={opt.label}
                  >
                    {color === opt.id && <Icon icon="mdi:check" className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
