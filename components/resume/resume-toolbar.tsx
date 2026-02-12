"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { LAYOUTS, PALETTES, type LayoutId, type PaletteId } from "@/lib/resume-templates"
import { cn } from "@/lib/utils"

// Mini preview thumbnails for all layouts
const LP: Record<string, React.ReactNode> = {
  classic: <div className="flex w-full flex-col gap-px p-0.5"><div className="h-1/4 rounded-sm bg-muted/40" /><div className="flex-1 rounded-sm bg-muted/30" /></div>,
  modern: <div className="flex w-full flex-col"><div className="h-1/3 bg-primary/20" /><div className="flex-1 bg-muted/30" /></div>,
  sidebar: <><div className="w-1/3 bg-primary/20" /><div className="flex-1 bg-muted/30" /></>,
  compact: <div className="flex w-full flex-col gap-px p-0.5"><div className="h-1/4 bg-muted/40 rounded-sm" /><div className="flex flex-1 gap-px"><div className="flex-1 bg-muted/30 rounded-sm" /><div className="flex-1 bg-muted/30 rounded-sm" /></div></div>,
  timeline: <div className="flex w-full"><div className="mx-auto w-px bg-primary/30" /></div>,
  elegant: <div className="flex w-full flex-col gap-px p-1"><div className="h-1/4 rounded border border-primary/30 bg-muted/20" /><div className="flex-1 rounded border border-border bg-muted/20" /></div>,
  minimal: <div className="flex w-full flex-col gap-1 p-1.5"><div className="h-px bg-muted/40" /><div className="flex-1" /><div className="h-px bg-muted/40" /></div>,
  creative: <><div className="w-2/5 bg-primary/25" /><div className="flex-1 bg-muted/20" /></>,
  flora: <><div className="w-1/4 bg-pink-200/60" /><div className="flex-1 bg-muted/20" /></>,
  "bold-header": <div className="flex w-full flex-col"><div className="h-2/5 bg-primary/30" /><div className="flex-1 bg-muted/20" /></div>,
  "corner-info": <div className="flex w-full flex-col p-0.5"><div className="mb-px flex"><div className="flex-1" /><div className="h-2 w-1/3 rounded-sm bg-muted/40" /></div><div className="flex flex-1 gap-px"><div className="flex-1 rounded-sm bg-muted/30" /><div className="flex-1 rounded-sm bg-muted/30" /></div></div>,
  "dark-sidebar": <><div className="w-1/3 bg-slate-700" /><div className="flex-1 bg-muted/15" /></>,
  "icon-grid": <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="flex gap-0.5"><div className="h-2 w-2 rounded-full bg-emerald-400/40" /><div className="flex-1 rounded-sm bg-muted/30" /></div><div className="flex gap-0.5"><div className="h-2 w-2 rounded-full bg-emerald-400/40" /><div className="flex-1 rounded-sm bg-muted/30" /></div></div>,
  "formal-table": <div className="flex w-full flex-col p-0.5 gap-px"><div className="h-1/5 rounded-sm bg-primary/20" /><div className="flex-1 rounded-sm border border-muted/40" /></div>,
  bracket: <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="flex items-center gap-0.5"><div className="h-2 w-0.5 bg-primary/50" /><div className="flex-1 bg-muted/30 h-2 rounded-sm" /></div><div className="flex flex-1 gap-px"><div className="flex-1 bg-muted/20 rounded-sm" /><div className="flex-1 bg-muted/20 rounded-sm" /></div></div>,
  "hello-split": <><div className="w-1/4 bg-primary/15 flex items-center justify-center"><div className="h-3/4 w-px bg-primary/40" /></div><div className="flex-1 bg-muted/20" /></>,
  "serif-blue": <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="h-1/5 border-b-2 border-blue-400/50" /><div className="flex-1 bg-muted/20 rounded-sm" /></div>,
  underline: <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="h-2 border-b border-muted/50" /><div className="flex-1 bg-muted/20 rounded-sm" /><div className="h-2 border-b border-muted/50" /><div className="flex-1 bg-muted/20 rounded-sm" /></div>,
  "pro-table": <div className="flex w-full flex-col"><div className="h-1/4 bg-slate-800" /><div className="flex-1 bg-muted/20 p-0.5"><div className="h-full rounded-sm border border-muted/30" /></div></div>,
  playful: <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-pink-300/60" /><div className="h-2 w-2 rounded-full bg-amber-300/60" /><div className="flex-1 h-2 bg-muted/30 rounded-full" /></div><div className="flex-1 bg-muted/20 rounded-sm" /></div>,
  nickname: <div className="flex w-full flex-col p-0.5"><div className="h-1/3 flex items-end"><div className="w-1/2 h-2 rounded-sm bg-muted/50" /></div><div className="flex-1 bg-muted/20 mt-0.5 rounded-sm" /></div>,
}

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
          <div className="mx-auto max-w-[900px] space-y-4">
            {/* Layout selector */}
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{dict.resume.layoutTemplate} ({LAYOUTS.length})</p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-10">
                {LAYOUTS.map((l) => (
                  <button key={l.id} onClick={() => onLayoutChange(l.id)} className={cn("rounded-lg border p-1.5 text-center transition-all", layout === l.id ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:border-muted-foreground/40")} title={l.description[locale]}>
                    <div className="mb-1 flex h-6 gap-0.5 overflow-hidden rounded border border-border/50">{LP[l.id]}</div>
                    <p className="text-[8px] font-bold text-foreground leading-tight truncate">{l.label[locale]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Palette + icon toggle row */}
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{dict.resume.colorPalette}</p>
                <div className="flex flex-wrap gap-2">
                  {PALETTES.map((p) => (
                    <button key={p.id} onClick={() => onPaletteChange(p.id)} className={cn("group flex flex-col items-center gap-1 transition-transform", palette === p.id && "scale-110")} title={p.label}>
                      <div className={cn("h-5 w-5 rounded-full border-2 transition-all", palette === p.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/40")} style={{ background: p.swatch }} />
                      <span className="text-[7px] text-muted-foreground">{p.label}</span>
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
