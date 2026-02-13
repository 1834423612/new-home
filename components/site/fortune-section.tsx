"use client"

import { useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"
import { trackFortuneRoll } from "@/lib/umami"

export function FortuneSection() {
  const { dict, locale } = useLocale()
  const { fortuneTags } = useSiteData()
  const { ref, isInView } = useInView()
  const [result, setResult] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [flipKey, setFlipKey] = useState(0)

  // Use DB tags if available, otherwise fall back to dict tags
  const tags = fortuneTags.length > 0
    ? fortuneTags.map((t) => locale === "zh" ? t.zh : t.en)
    : dict.fortune.tags

  const draw = useCallback(() => {
    if (isDrawing || tags.length === 0) return
    setIsDrawing(true)
    setResult(null)

    let count = 0
    const maxCount = 12
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * tags.length)
      setResult(tags[randomIdx])
      count++
      if (count >= maxCount) {
        clearInterval(interval)
        const finalIdx = Math.floor(Math.random() * tags.length)
        const finalTag = tags[finalIdx]
        setResult(finalTag)
        setFlipKey((k) => k + 1)
        setIsDrawing(false)
        trackFortuneRoll(finalTag)
      }
    }, 100)
  }, [isDrawing, tags])

  return (
    <section id="fortune" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-2xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        {/* Section label */}
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">05</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.fortune.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-10 text-center font-mono text-sm text-muted-foreground">
          {dict.fortune.subtitle}
        </p>

        {/* Fortune card */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "relative mb-8 h-[160px] w-full max-w-md overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-500",
              result
                ? "border-primary bg-card shadow-[0_0_40px_hsl(var(--primary)/0.1)]"
                : "border-border bg-secondary/50"
            )}
          >
            {result ? (
              <div
                key={flipKey}
                className="flex h-full flex-col items-center justify-center p-8 animate-fade-up"
              >
                <Icon icon="mdi:ticket-confirmation-outline" className="mb-3 h-8 w-8 shrink-0 text-primary" />
                <p className="text-xs font-mono text-muted-foreground mb-2 shrink-0">{dict.fortune.result}</p>
                <p className="text-center text-base font-medium leading-snug text-foreground line-clamp-2">
                  {result}
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8">
                <Icon icon="mdi:help-circle-outline" className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-mono text-xs text-muted-foreground/40">
                  {"?"}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={draw}
            disabled={isDrawing}
            className={cn(
              "group flex items-center gap-2 rounded-full px-8 py-3 font-mono text-sm font-medium transition-all duration-300",
              isDrawing
                ? "border border-border text-muted-foreground cursor-wait"
                : "bg-primary text-primary-foreground hover:shadow-[0_0_24px_hsl(var(--primary)/0.4)] active:scale-95"
            )}
          >
            <Icon
              icon={isDrawing ? "mdi:loading" : result ? "mdi:refresh" : "mdi:gesture-tap"}
              className={cn("h-5 w-5", isDrawing && "animate-spin")}
            />
            {isDrawing ? dict.fortune.drawing : result ? dict.fortune.again : dict.fortune.draw}
          </button>
        </div>
      </div>
    </section>
  )
}
