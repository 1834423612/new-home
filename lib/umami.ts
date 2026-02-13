/**
 * Umami Analytics Utility Library
 *
 * Provides typed helpers for tracking custom events via Umami.
 * All functions are safe to call even when Umami is not loaded — they silently no-op.
 *
 * Usage:
 *   import { trackEvent, trackOutboundLink, trackSectionView } from "@/lib/umami"
 *   trackEvent("button-click", { label: "Download Resume" })
 */

/* ──────────────── Core types ──────────────── */

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void
        }
    }
}

type EventData = Record<string, string | number | boolean>

/* ──────────────── Low-level API ──────────────── */

/** Send a custom event to Umami. Safe no-op when Umami is not loaded. */
export function trackEvent(name: string, data?: EventData): void {
    try {
        window.umami?.track(name, data)
    } catch {
        // silently ignore — tracking should never break the app
    }
}

/* ──────────────── Navigation & Section Tracking ──────────────── */

/** Track when a user views/scrolls into a particular section */
export function trackSectionView(sectionId: string): void {
    trackEvent("section-view", { section: sectionId })
}

/** Track navigation click (side-nav, mobile-nav anchor clicks) */
export function trackNavClick(target: string, source: "side-nav" | "mobile-nav"): void {
    trackEvent("nav-click", { target, source })
}

/* ──────────────── Link Tracking ──────────────── */

/** Track outbound (external) link clicks */
export function trackOutboundLink(url: string, label?: string): void {
    trackEvent("outbound-link", {
        url,
        ...(label ? { label } : {}),
    })
}

/** Track internal navigation (e.g. view project detail, view more) */
export function trackInternalLink(url: string, label?: string): void {
    trackEvent("internal-link", {
        url,
        ...(label ? { label } : {}),
    })
}

/* ──────────────── Button & Interaction Tracking ──────────────── */

/** Track a generic button click */
export function trackButtonClick(buttonName: string, extra?: EventData): void {
    trackEvent("button-click", { button: buttonName, ...extra })
}

/** Track project category filter */
export function trackCategoryFilter(category: string): void {
    trackEvent("category-filter", { category })
}

/** Track theme change (mode or color) */
export function trackThemeChange(type: "mode" | "color", value: string): void {
    trackEvent("theme-change", { type, value })
}

/** Track language toggle */
export function trackLanguageToggle(newLocale: string): void {
    trackEvent("language-toggle", { locale: newLocale })
}

/* ──────────────── Contact & Social ──────────────── */

/** Track social link click */
export function trackSocialClick(platform: string, url: string): void {
    trackEvent("social-click", { platform, url })
}

/** Track email link click */
export function trackEmailClick(email: string): void {
    trackEvent("email-click", { email })
}

/** Track copy action (e.g. copy WeChat ID) */
export function trackCopyAction(what: string, content: string): void {
    trackEvent("copy-action", { what, content })
}

/* ──────────────── Content Engagement ──────────────── */

/** Track project card click */
export function trackProjectClick(projectSlug: string, projectTitle: string): void {
    trackEvent("project-click", { slug: projectSlug, title: projectTitle })
}

/** Track award card click */
export function trackAwardClick(awardSlug: string, awardTitle: string): void {
    trackEvent("award-click", { slug: awardSlug, title: awardTitle })
}

/** Track site/tool card click */
export function trackSiteClick(siteId: string, siteName: string, url: string): void {
    trackEvent("site-click", { id: siteId, name: siteName, url })
}

/** Track game card click */
export function trackGameClick(gameId: string, gameName: string): void {
    trackEvent("game-click", { id: gameId, name: gameName })
}

/** Track fortune tag roll */
export function trackFortuneRoll(tagText: string): void {
    trackEvent("fortune-roll", { tag: tagText })
}

/** Track "view more" / "view all" clicks */
export function trackViewMore(section: string, targetUrl: string): void {
    trackEvent("view-more", { section, url: targetUrl })
}

/** Track resume page visit & actions */
export function trackResumeAction(action: string, extra?: EventData): void {
    trackEvent("resume-action", { action, ...extra })
}

/** Track sponsor link click */
export function trackSponsorClick(sponsorName: string, url: string): void {
    trackEvent("sponsor-click", { name: sponsorName, url })
}

/** Track file download or filing link click */
export function trackFooterLink(type: string, url: string): void {
    trackEvent("footer-link", { type, url })
}

/** Track skill category view/interaction */
export function trackSkillInteraction(skillName: string, category: string): void {
    trackEvent("skill-interaction", { skill: skillName, category })
}

/** Track search / filter interaction */
export function trackSearch(query: string, section: string): void {
    trackEvent("search", { query, section })
}

/** Track scroll depth (percentage) */
export function trackScrollDepth(depth: number): void {
    trackEvent("scroll-depth", { depth })
}

/** Track time on page (in seconds) */
export function trackTimeOnPage(seconds: number, page: string): void {
    trackEvent("time-on-page", { seconds, page })
}
