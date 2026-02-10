"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"

interface HitokotoData {
  hitokoto: string
  from?: string
  from_who?: string
}

export function HeroSection() {
  const { dict } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [hitokoto, setHitokoto] = useState<HitokotoData | null>(null)
  const [hitokotoFading, setHitokotoFading] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  const fetchHitokoto = useCallback(async () => {
    try {
      setHitokotoFading(true)
      const res = await fetch("https://international.v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=k")
      if (res.ok) {
        const data = await res.json()
        setTimeout(() => {
          setHitokoto(data)
          setHitokotoFading(false)
        }, 300)
      }
    } catch {
      setHitokotoFading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchHitokoto()
  }, [fetchHitokoto])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Animated background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, hsl(var(--primary) / 0.06), transparent 60%)`,
        }}
      />

      {/* Grid lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex max-w-3xl flex-col items-center text-center transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Status badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow text-emerald-400" />
          <span className="text-xs font-mono text-muted-foreground">
            {dict.hero.location}
          </span>
        </div>

        {/* Name */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
          <span className="text-muted-foreground text-2xl font-normal block mb-2 md:text-3xl">
            {dict.hero.greeting}
          </span>
          <span className="text-foreground">{dict.hero.name}</span>
          <span className="text-primary font-mono text-xl md:text-2xl ml-3 align-middle">
            @{dict.hero.alias}
          </span>
        </h1>

        {/* Hitokoto tagline */}
        <div className="mb-4 max-w-xl text-center">
          <button
            onClick={fetchHitokoto}
            className={`group text-lg leading-relaxed text-muted-foreground md:text-xl transition-all duration-300 hover:text-foreground cursor-pointer ${hitokotoFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
            title={dict.hero.refreshHitokoto}
          >
            {hitokoto ? (
              <>
                <span>{hitokoto.hitokoto}</span>
                {hitokoto.from && (
                  <span className="mt-1 block text-xs font-mono text-muted-foreground/50">
                    {"-- "}{hitokoto.from_who ? `${hitokoto.from_who}` : ""}{hitokoto.from ? `《${hitokoto.from}》` : ""}
                  </span>
                )}
              </>
            ) : (
              <span>{dict.hero.tagline}</span>
            )}
          </button>
          <Icon icon="mdi:refresh" className="mx-auto mt-2 h-3.5 w-3.5 text-muted-foreground/30 transition-colors hover:text-primary cursor-pointer" onClick={fetchHitokoto} />
        </div>

        {/* Subtitle */}
        <p className="mb-10 font-mono text-sm text-muted-foreground/60">
          {'// '}{dict.hero.subtitle}
        </p>

        {/* CTA row */}
        <div className="flex items-center gap-4">
          <a
            href="#about"
            className="group flex items-center gap-2 rounded-full border border-primary bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
          >
            {dict.nav.about}
            <Icon icon="mdi:arrow-down" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <a
            href="/resume"
            className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary"
          >
            <Icon icon="mdi:file-document-outline" className="h-4 w-4" />
            {dict.nav.resume}
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className={`absolute bottom-8 flex flex-col items-center gap-2 transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
          {dict.hero.scrollHint}
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/40 to-transparent animate-bounce" />
      </div>
    </section>
  )
}
