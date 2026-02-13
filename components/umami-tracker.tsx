"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useSiteConfig } from "@/hooks/use-site-config"
import { trackOutboundLink, trackScrollDepth, trackTimeOnPage, trackSectionView } from "@/lib/umami"

/**
 * UmamiTracker — drop into the root layout once.
 *
 * Responsibilities:
 * 1. Dynamically inject the Umami <script> based on admin config
 * 2. Auto-track outbound link clicks (all `<a>` with external href)
 * 3. Track scroll depth milestones (25 / 50 / 75 / 100 %)
 * 4. Track time-on-page when the user leaves
 * 5. Track section visibility via IntersectionObserver
 */
export function UmamiTracker() {
    const { config } = useSiteConfig()
    const pathname = usePathname()

    const scriptUrl = config["umami_script_url"] || ""
    const websiteId = config["umami_website_id"] || ""
    const domains = config["umami_domains"] || ""
    const enabled = config["umami_enabled"] !== "false" // default on

    const scriptInjected = useRef(false)
    const scrollMilestones = useRef(new Set<number>())
    const entryTime = useRef(Date.now())

    /* ── 1. Inject Umami script ── */
    useEffect(() => {
        if (!enabled || !scriptUrl || !websiteId) return
        if (scriptInjected.current) return

        // Don't track admin pages
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return

        const existing = document.querySelector(`script[data-website-id="${websiteId}"]`)
        if (existing) { scriptInjected.current = true; return }

        const script = document.createElement("script")
        script.src = scriptUrl
        script.defer = true
        script.setAttribute("data-website-id", websiteId)
        if (domains) script.setAttribute("data-domains", domains)
        // Disable auto-track so we control page-view tracking for SPA
        // Actually keep auto-track on — Umami handles SPA with pushState listener
        document.head.appendChild(script)
        scriptInjected.current = true

        return () => {
            // Don't remove on cleanup — keep script alive across route changes
        }
    }, [enabled, scriptUrl, websiteId, domains])

    /* ── 2. Track outbound links (event delegation) ── */
    useEffect(() => {
        if (!enabled || !scriptUrl || !websiteId) return

        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null
            if (!anchor) return

            const href = anchor.href
            if (!href) return

            try {
                const url = new URL(href, window.location.origin)
                // External link
                if (url.hostname !== window.location.hostname) {
                    trackOutboundLink(href, anchor.textContent?.trim().slice(0, 100) || "")
                }
            } catch {
                // invalid URL, ignore
            }
        }

        document.addEventListener("click", handleClick, { capture: true })
        return () => document.removeEventListener("click", handleClick, { capture: true })
    }, [enabled, scriptUrl, websiteId])

    /* ── 3. Scroll depth tracking ── */
    useEffect(() => {
        if (!enabled || !scriptUrl || !websiteId) return

        scrollMilestones.current = new Set()

        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            if (docHeight <= 0) return
            const percent = Math.round((scrollTop / docHeight) * 100)

            for (const milestone of [25, 50, 75, 100]) {
                if (percent >= milestone && !scrollMilestones.current.has(milestone)) {
                    scrollMilestones.current.add(milestone)
                    trackScrollDepth(milestone)
                }
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [enabled, scriptUrl, websiteId, pathname])

    /* ── 4. Time on page tracking ── */
    useEffect(() => {
        if (!enabled || !scriptUrl || !websiteId) return

        entryTime.current = Date.now()

        const handleBeforeUnload = () => {
            const seconds = Math.round((Date.now() - entryTime.current) / 1000)
            if (seconds > 2) {
                trackTimeOnPage(seconds, pathname)
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            // Also fire on route change
            const seconds = Math.round((Date.now() - entryTime.current) / 1000)
            if (seconds > 2) {
                trackTimeOnPage(seconds, pathname)
            }
        }
    }, [enabled, scriptUrl, websiteId, pathname])

    /* ── 5. Section visibility observer (homepage only) ── */
    const observedSections = useRef(new Set<string>())

    const setupSectionObserver = useCallback(() => {
        if (!enabled || !scriptUrl || !websiteId) return
        if (pathname !== "/") return // Only on homepage

        observedSections.current = new Set()

        const sectionIds = [
            "hero", "about", "projects", "awards", "experience",
            "skills", "fortune", "games", "contact",
        ]

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && !observedSections.current.has(entry.target.id)) {
                        observedSections.current.add(entry.target.id)
                        trackSectionView(entry.target.id)
                    }
                }
            },
            { threshold: 0.3 }
        )

        // Small delay to let DOM render
        const timer = setTimeout(() => {
            for (const id of sectionIds) {
                const el = document.getElementById(id)
                if (el) observer.observe(el)
            }
        }, 1000)

        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [enabled, scriptUrl, websiteId, pathname])

    useEffect(() => {
        return setupSectionObserver()
    }, [setupSectionObserver])

    // This component renders nothing
    return null
}
