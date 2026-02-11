"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { LAYOUTS, PALETTES, type LayoutId, type PaletteId } from "@/lib/resume-templates"
import { cn } from "@/lib/utils"

interface Props {
  layout: LayoutId
  palette: PaletteId
  showIcons: boolean
  locale: "zh" | "en"
  onLayoutChange: (l: LayoutId) => void
  onPaletteChange: (p: PaletteId) => void
  onToggleIcons: () => void
  onToggleLocale: () => void
  onPrint: () => void
  backHref?: string
}

export function ResumeToolbar({ layout, palette, showIcons, locale, onLayoutChange, onPaletteChange, onToggleIcons, onToggleLocale, onPrint, backHref = "/" }: Props) {
  const { dict } = useLocale()
  const [showPanel, setShowPanel] = useState(false)
  const currentLayout = LAYOUTS.find((l) => l.id === layout) || LAYOUTS[0]

  return (
    <>
      {/* Sticky top bar */}
      <div className="no-print sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-2 backdrop-blur-md sm:px-6">
        <a href={backHref} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          <span className="font-mono text-xs">{dict.resume.back}</span>
        </a>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowPanel(!showPanel)} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-mono transition-colors", showPanel ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary")}>
            <Icon icon="mdi:tune-variant" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{currentLayout.label[locale]}</span>
          </button>
          <button onClick={onToggleLocale} className="rounded-full border border-border px-2.5 py-1.5 text-xs font-mono text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            {dict.common.langSwitch}
          </button>
          <button onClick={onPrint} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:opacity-90">
            <Icon icon="mdi:file-pdf-box" className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showPanel && (
        <div className="no-print border-b border-border bg-card/60 px-4 py-5 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-[800px] space-y-4">
            {/* Layout selector */}
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{dict.resume.layoutTemplate}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {LAYOUTS.map((l) => (
                  <button key={l.id} onClick={() => onLayoutChange(l.id)} className={cn("rounded-lg border p-2.5 text-left transition-all", layout === l.id ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:border-muted-foreground/40")}>
                    {/* Layout mini preview */}
                    <div className="mb-1.5 flex h-8 gap-0.5 rounded overflow-hidden border border-border/50">
                      {l.id === "sidebar" && <><div className="w-1/3 bg-primary/20" /><div className="flex-1 bg-muted/30" /></>}
                      {l.id === "modern" && <div className="flex w-full flex-col"><div className="h-1/3 bg-primary/20" /><div className="flex-1 bg-muted/30" /></div>}
                      {l.id === "compact" && <div className="flex w-full flex-col gap-px p-0.5"><div className="h-1/4 bg-muted/40 rounded-sm" /><div className="flex flex-1 gap-px"><div className="flex-1 bg-muted/30 rounded-sm" /><div className="flex-1 bg-muted/30 rounded-sm" /></div></div>}
                      {l.id === "timeline" && <div className="flex w-full"><div className="mx-auto w-px bg-primary/30" /></div>}
                      {l.id === "classic" && <div className="flex w-full flex-col gap-px p-0.5"><div className="h-1/4 bg-muted/40 rounded-sm" /><div className="flex-1 bg-muted/30 rounded-sm" /></div>}
                    </div>
                    <p className="text-[11px] font-bold text-foreground">{l.label[locale]}</p>
                    <p className="text-[9px] text-muted-foreground">{l.description[locale]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Palette + icon toggle row */}
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{dict.resume.colorPalette}</p>
                <div className="flex gap-2">
                  {PALETTES.map((p) => (
                    <button key={p.id} onClick={() => onPaletteChange(p.id)} className={cn("group flex flex-col items-center gap-1 transition-transform", palette === p.id && "scale-110")} title={p.label}>
                      <div className={cn("h-6 w-6 rounded-full border-2 transition-all", palette === p.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/40")} style={{ background: p.swatch }} />
                      <span className="text-[8px] text-muted-foreground">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={onToggleIcons} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors", showIcons ? "border-primary text-primary" : "border-border text-muted-foreground")}>
                <Icon icon={showIcons ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="h-3.5 w-3.5" />
                {showIcons ? dict.resume.iconsOn : dict.resume.iconsOff}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
