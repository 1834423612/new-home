// Resume layout templates and color palettes

export type LayoutId = "classic" | "modern" | "sidebar" | "compact" | "timeline"
export type PaletteId = "dark-gold" | "clean-blue" | "rose" | "emerald" | "mono" | "navy"

export interface LayoutOption {
  id: LayoutId
  label: { zh: string; en: string }
  description: { zh: string; en: string }
}

export interface PaletteOption {
  id: PaletteId
  label: string
  swatch: string // hex for preview
  bg: string; text: string; accent: string; cardBg: string; border: string; muted: string
  headingBg: string; headingText: string
}

export interface ResumeData {
  name: { zh: string; en: string }
  tagline: { zh: string; en: string }
  email: string
  website: string
  github: string
  location: string
  summary: { zh: string; en: string }
  education: { school: string; detail: { zh: string; en: string }; period: string }[]
  experiences: { title: { zh: string; en: string }; org: { zh: string; en: string }; description: { zh: string; en: string }; startDate: string; endDate?: string; icon?: string }[]
  projects: { title: { zh: string; en: string }; description: { zh: string; en: string }; date: string; tags: string[]; link?: string }[]
  skillGroups: { label: { zh: string; en: string }; items: { name: string; icon?: string }[] }[]
}

export const LAYOUTS: LayoutOption[] = [
  { id: "classic", label: { zh: "经典", en: "Classic" }, description: { zh: "传统单栏布局", en: "Traditional single-column" } },
  { id: "modern", label: { zh: "现代", en: "Modern" }, description: { zh: "带彩色头部横幅", en: "Colored header banner" } },
  { id: "sidebar", label: { zh: "侧栏", en: "Sidebar" }, description: { zh: "左侧信息栏+右侧内容", en: "Left info bar + right content" } },
  { id: "compact", label: { zh: "紧凑", en: "Compact" }, description: { zh: "高密度双栏", en: "High-density two-column" } },
  { id: "timeline", label: { zh: "时间线", en: "Timeline" }, description: { zh: "时间轴风格", en: "Timeline-style layout" } },
]

export const PALETTES: PaletteOption[] = [
  { id: "dark-gold", label: "Dark Gold", swatch: "#e5a830", bg: "#0f1114", text: "#e8e3d8", accent: "#e5a830", cardBg: "#16181d", border: "#2a2d35", muted: "#7a7870", headingBg: "#e5a830", headingText: "#0f1114" },
  { id: "clean-blue", label: "Clean Blue", swatch: "#3b82f6", bg: "#ffffff", text: "#1a1a2e", accent: "#3b82f6", cardBg: "#f8fafc", border: "#e2e8f0", muted: "#64748b", headingBg: "#3b82f6", headingText: "#ffffff" },
  { id: "rose", label: "Rose", swatch: "#e84a7a", bg: "#fdf2f4", text: "#1c1017", accent: "#e84a7a", cardBg: "#fff5f7", border: "#f5d0d8", muted: "#9c6b78", headingBg: "#e84a7a", headingText: "#ffffff" },
  { id: "emerald", label: "Emerald", swatch: "#10b981", bg: "#f0fdf4", text: "#0a2618", accent: "#059669", cardBg: "#f8fefb", border: "#bbf7d0", muted: "#5c8a6e", headingBg: "#059669", headingText: "#ffffff" },
  { id: "mono", label: "Mono", swatch: "#404040", bg: "#fafafa", text: "#09090b", accent: "#18181b", cardBg: "#ffffff", border: "#e4e4e7", muted: "#71717a", headingBg: "#18181b", headingText: "#fafafa" },
  { id: "navy", label: "Navy", swatch: "#1e3a5f", bg: "#f1f5f9", text: "#0f172a", accent: "#1e3a5f", cardBg: "#ffffff", border: "#cbd5e1", muted: "#475569", headingBg: "#1e3a5f", headingText: "#ffffff" },
]
