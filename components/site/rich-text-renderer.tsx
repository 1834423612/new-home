"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"

// Lazy-load ReactPlayer for Bilibili / SoundCloud fallback only
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false })

// ── URL helpers ─────────────────────────────────────────────────────────

function needsReactPlayer(url: string): boolean {
  return /bilibili|soundcloud|dailymotion|twitch|mixcloud/i.test(url)
}
function isYouTube(url: string): boolean {
  return /youtu\.?be/i.test(url)
}
function isVimeo(url: string): boolean {
  return /vimeo\.com/i.test(url)
}
function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/) ||
    url.match(/^([a-zA-Z0-9_-]{11})$/)
  return m ? m[1] : null
}
function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

// ── Progress memory ─────────────────────────────────────────────────────

function memKey(src: string) {
  return `plyr_pos_${btoa(src).slice(0, 40)}`
}
function savePos(src: string, t: number) {
  try { localStorage.setItem(memKey(src), String(t)) } catch {}
}
function loadPos(src: string): number {
  try { return parseFloat(localStorage.getItem(memKey(src)) || "0") || 0 } catch { return 0 }
}
function clearPos(src: string) {
  try { localStorage.removeItem(memKey(src)) } catch {}
}

// ── Plyr Video ──────────────────────────────────────────────────────────

function PlyrVideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const plyrRef = useRef<any>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let dead = false

    async function boot() {
      const Plyr = (await import("plyr")).default
      await import("plyr/dist/plyr.css")
      if (dead || !wrap) return

      wrap.innerHTML = ""

      const yt = isYouTube(src)
      const vi = isVimeo(src)
      let el: HTMLElement

      if (yt) {
        const vid = extractYouTubeId(src)
        if (!vid) { setErr(true); return }
        el = document.createElement("div")
        el.setAttribute("data-plyr-provider", "youtube")
        el.setAttribute("data-plyr-embed-id", vid)
      } else if (vi) {
        const vid = extractVimeoId(src)
        if (!vid) { setErr(true); return }
        el = document.createElement("div")
        el.setAttribute("data-plyr-provider", "vimeo")
        el.setAttribute("data-plyr-embed-id", vid)
      } else {
        // Direct file -- preload="none" to prevent 206 spam.
        // If a poster is set the browser shows it immediately without
        // any network request. If no poster we still use "none" and
        // Plyr shows its play-large overlay instead.
        const v = document.createElement("video")
        v.setAttribute("src", src)
        v.setAttribute("preload", "none")
        v.setAttribute("playsinline", "")
        v.setAttribute("crossorigin", "anonymous")
        if (poster) v.setAttribute("poster", poster)
        el = v
      }

      wrap.appendChild(el)

      const player = new Plyr(el, {
        controls: [
          "play-large", "play", "progress", "current-time", "duration",
          "mute", "volume", "captions", "settings", "pip",
          "airplay", "fullscreen",
        ],
        settings: ["quality", "speed", "loop"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        invertTime: false,
        blankVideo: "",
      })
      plyrRef.current = player

      // ── Restore saved position ──
      // For direct files the video data is not loaded yet (`preload=none`),
      // so we listen on `loadedmetadata` which fires once the user hits play
      // (or once the browser decides to load). For YT/Vimeo `ready` works.
      const saved = loadPos(src)

      if (yt || vi) {
        let restored = false
        const tryRestore = () => {
          if (!restored && saved > 2) {
            player.currentTime = saved
            restored = true
          }
        }
        player.on("ready", tryRestore)
        // YT sometimes fires ready before internal player is truly ready
        player.on("playing", tryRestore)
      } else {
        // For HTML5 video, listen on the underlying <video> element
        const videoEl = el as HTMLVideoElement
        const onMeta = () => {
          if (saved > 2 && saved < videoEl.duration - 2) {
            videoEl.currentTime = saved
          }
        }
        videoEl.addEventListener("loadedmetadata", onMeta, { once: true })
      }

      // ── Persist progress (throttled to every 3s) ──
      let lastSave = 0
      player.on("timeupdate", () => {
        const now = player.currentTime
        if (now - lastSave > 3) {
          lastSave = now
          savePos(src, now)
        }
      })
      // Also save on pause so short sessions are captured
      player.on("pause", () => savePos(src, player.currentTime))

      // Clear on finish
      player.on("ended", () => clearPos(src))

      player.on("error", () => setErr(true))
    }

    boot()
    return () => {
      dead = true
      if (plyrRef.current) { try { plyrRef.current.destroy() } catch {} }
      plyrRef.current = null
    }
  }, [src, poster])

  if (err) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-secondary/50 p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Icon icon="mdi:video-off-outline" className="h-8 w-8" />
          <p className="text-sm">Failed to load video</p>
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open link directly</a>
        </div>
      </div>
    )
  }

  return (
    <div className="rich-text-video-wrapper plyr-container">
      <div ref={wrapRef} />
    </div>
  )
}

// ── Plyr Audio ──────────────────────────────────────────────────────────

function PlyrAudioPlayer({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const plyrRef = useRef<any>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let dead = false

    async function boot() {
      const Plyr = (await import("plyr")).default
      await import("plyr/dist/plyr.css")
      if (dead || !wrap) return

      wrap.innerHTML = ""
      const a = document.createElement("audio")
      a.setAttribute("src", src)
      a.setAttribute("preload", "none")
      a.setAttribute("crossorigin", "anonymous")
      wrap.appendChild(a)

      const player = new Plyr(a, {
        controls: ["play", "progress", "current-time", "duration", "mute", "volume", "settings"],
        settings: ["speed"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        invertTime: false,
      })
      plyrRef.current = player

      const saved = loadPos(src)
      a.addEventListener("loadedmetadata", () => {
        if (saved > 2 && saved < a.duration - 2) a.currentTime = saved
      }, { once: true })

      let lastSave = 0
      player.on("timeupdate", () => {
        const now = player.currentTime
        if (now - lastSave > 3) { lastSave = now; savePos(src, now) }
      })
      player.on("pause", () => savePos(src, player.currentTime))
      player.on("ended", () => clearPos(src))
      player.on("error", () => setErr(true))
    }

    boot()
    return () => {
      dead = true
      if (plyrRef.current) { try { plyrRef.current.destroy() } catch {} }
      plyrRef.current = null
    }
  }, [src])

  if (err) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3">
        <Icon icon="mdi:music-off" className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load audio</p>
        <a href={src} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-primary hover:underline">Open link</a>
      </div>
    )
  }

  return (
    <div className="rich-text-audio-wrapper plyr-container">
      <div ref={wrapRef} />
    </div>
  )
}

// ── ReactPlayer fallback (Bilibili, SoundCloud, etc.) ───────────────────

function ReactPlayerFallback({ src, type }: { src: string; type: "video" | "audio" }) {
  const [err, setErr] = useState(false)

  if (err) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-secondary/50 p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Icon icon={type === "video" ? "mdi:video-off-outline" : "mdi:music-off"} className="h-8 w-8" />
          <p className="text-sm">Failed to load media</p>
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open link directly</a>
        </div>
      </div>
    )
  }

  if (type === "audio") {
    return (
      <div className="rich-text-audio-wrapper">
        <ReactPlayer url={src} width="100%" height={80} controls playing={false} onError={() => setErr(true)} config={{ file: { forceAudio: true } }} />
      </div>
    )
  }

  return (
    <div className="rich-text-video-wrapper">
      <ReactPlayer url={src} width="100%" height="100%" controls playing={false} onError={() => setErr(true)} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  )
}

// ── Dispatchers ─────────────────────────────────────────────────────────

function VideoEmbed({ src, poster }: { src: string; poster?: string }) {
  if (needsReactPlayer(src)) return <ReactPlayerFallback src={src} type="video" />
  return <PlyrVideoPlayer src={src} poster={poster} />
}

function AudioEmbed({ src }: { src: string }) {
  if (needsReactPlayer(src)) return <ReactPlayerFallback src={src} type="audio" />
  return <PlyrAudioPlayer src={src} />
}

// ── Image Lightbox ──────────────────────────────────────────────────────

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image preview">
      <button onClick={onClose} className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80" aria-label="Close">
        <Icon icon="mdi:close" className="h-5 w-5" />
      </button>
      <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body,
  )
}

// ── Main Renderer ───────────────────────────────────────────────────────

interface MediaMount {
  id: string
  type: "video" | "audio"
  src: string
  poster?: string
  element: HTMLElement
}

export function RichTextRenderer({ content, className }: { content: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounts, setMounts] = useState<MediaMount[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)

  // Set innerHTML imperatively so React never destroys the inner DOM
  // that portal targets point to.
  useEffect(() => {
    const c = containerRef.current
    if (!c) return

    c.innerHTML = content || ""

    const list: MediaMount[] = []

    c.querySelectorAll<HTMLElement>('[data-type="video"]').forEach((el, i) => {
      const src = el.getAttribute("data-src") || ""
      const poster = el.getAttribute("data-poster") || undefined
      if (src) {
        const id = `v-${i}`
        el.innerHTML = ""
        el.id = id
        list.push({ id, type: "video", src, poster, element: el })
      }
    })

    c.querySelectorAll<HTMLElement>('[data-type="audio"]').forEach((el, i) => {
      const src = el.getAttribute("data-src") || ""
      if (src) {
        const id = `a-${i}`
        el.innerHTML = ""
        el.id = id
        list.push({ id, type: "audio", src, element: el })
      }
    })

    c.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      img.style.cursor = "zoom-in"
      img.classList.add("rich-text-image")
      img.addEventListener("click", () => setLightbox(img.src))
    })

    setMounts(list)
    return () => setMounts([])
  }, [content])

  const closeLb = useCallback(() => setLightbox(null), [])

  if (!content) return null

  return (
    <>
      <div ref={containerRef} className={cn("rich-text-content prose prose-sm dark:prose-invert max-w-none", className)} />

      {mounts.map((m) =>
        createPortal(
          m.type === "video"
            ? <VideoEmbed key={m.id} src={m.src} poster={m.poster} />
            : <AudioEmbed key={m.id} src={m.src} />,
          m.element,
        ),
      )}

      {lightbox && <ImageLightbox src={lightbox} alt="Full-size preview" onClose={closeLb} />}
    </>
  )
}
