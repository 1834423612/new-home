// Resume layout templates and color palettes

export type LayoutId = "classic" | "modern" | "sidebar" | "compact" | "timeline" | "elegant" | "minimal" | "creative" | "flora" | "bold-header" | "corner-info" | "dark-sidebar" | "icon-grid" | "formal-table" | "bracket" | "hello-split" | "serif-blue" | "underline" | "pro-table" | "playful"
export type PaletteId = "dark-gold" | "clean-blue" | "rose" | "emerald" | "mono" | "navy" | "sakura" | "sunset" | "ocean" | "lavender"
export type PaperSize = "letter" | "a4" | "custom"
export type CustomSectionType = "list" | "text" | "cards" | "tags"

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

export interface SocialLink {
  platform: string   // e.g. "Facebook", "Instagram", "X (Twitter)" etc.
  icon: string       // iconify name, e.g. "mdi:facebook"
  url: string
}

export interface EmailEntry {
  label: string      // e.g. "Personal", "School", "Work"
  address: string
}

export interface CustomSection {
  id: string
  title: { zh: string; en: string }
  icon: string
  type: CustomSectionType
  items: string[]
}

export interface ResumeData {
  name: { zh: string; en: string }
  nickname?: string       // optional display nickname
  tagline: { zh: string; en: string }
  email: string          // primary email (kept for backward compat)
  emails: EmailEntry[]   // multiple emails
  phone: string
  website: string
  github: string
  linkedin: string
  location: string
  avatar: string
  socialLinks: SocialLink[]
  summary: { zh: string; en: string }
  education: { school: string; degree: { zh: string; en: string }; detail: { zh: string; en: string }; period: string }[]
  experiences: { title: { zh: string; en: string }; org: { zh: string; en: string }; description: { zh: string; en: string }; startDate: string; endDate?: string; icon?: string }[]
  projects: { title: { zh: string; en: string }; description: { zh: string; en: string }; date: string; tags: string[]; link?: string }[]
  skillGroups: { label: { zh: string; en: string }; items: { name: string; icon?: string }[] }[]
  awards?: { zh: string; en: string }[]
  customSections: CustomSection[]
}

export const PAPER_SIZES: Record<PaperSize, { w: number; h: number; label: string }> = {
  letter: { w: 816, h: 1056, label: "US Letter" },
  a4: { w: 794, h: 1123, label: "A4" },
  custom: { w: 800, h: 1100, label: "Custom" },
}

export const SOCIAL_PRESETS: { platform: string; icon: string }[] = [
  { platform: "Facebook", icon: "mdi:facebook" },
  { platform: "Instagram", icon: "mdi:instagram" },
  { platform: "X (Twitter)", icon: "ri:twitter-x-fill" },
  { platform: "YouTube", icon: "mdi:youtube" },
  { platform: "TikTok", icon: "ic:baseline-tiktok" },
  { platform: "WeChat", icon: "mdi:wechat" },
  { platform: "Bilibili", icon: "ri:bilibili-fill" },
  { platform: "Discord", icon: "ic:baseline-discord" },
  { platform: "Telegram", icon: "mdi:telegram" },
  { platform: "Reddit", icon: "mdi:reddit" },
]

export const LAYOUTS: LayoutOption[] = [
  { id: "classic", label: { zh: "经典", en: "Classic" }, description: { zh: "传统单栏布局", en: "Traditional single-column" } },
  { id: "modern", label: { zh: "现代", en: "Modern" }, description: { zh: "带彩色头部横幅", en: "Colored header banner" } },
  { id: "sidebar", label: { zh: "侧栏", en: "Sidebar" }, description: { zh: "左侧信息栏+右侧内容", en: "Left info bar + right content" } },
  { id: "compact", label: { zh: "紧凑", en: "Compact" }, description: { zh: "高密度双栏", en: "High-density two-column" } },
  { id: "timeline", label: { zh: "时间线", en: "Timeline" }, description: { zh: "时间轴风格", en: "Timeline-style layout" } },
  { id: "elegant", label: { zh: "典雅", en: "Elegant" }, description: { zh: "优雅边框与装饰线", en: "Bordered with decorative lines" } },
  { id: "minimal", label: { zh: "极简", en: "Minimal" }, description: { zh: "大量留白纯排版", en: "Whitespace-heavy typography" } },
  { id: "creative", label: { zh: "创意", en: "Creative" }, description: { zh: "大胆色块侧边栏", en: "Bold accent sidebar" } },
  // New 12 templates
  { id: "bold-header",  label: { zh: "蓝粉圆角", en: "Blue/Pink Blobs" }, description: { zh: "蓝粉圆角装饰 + 左信息右内容", en: "Blobs + left info / right content" } }, // 图1-左上
  { id: "hello-split",  label: { zh: "HELLO 渐变", en: "Hello Gradient" }, description: { zh: "大头像 + 竖排 HELLO + 渐变底", en: "Large photo + HELLO vertical + gradient" } }, // 图1-中上
  { id: "serif-blue",   label: { zh: "极简蓝块", en: "Minimal Blue Photo" }, description: { zh: "RESUME 标题 + 右侧蓝块照片", en: "Resume title + blue block photo" } }, // 图1-右上
  { id: "underline",    label: { zh: "紫色波浪", en: "Purple Wave" }, description: { zh: "紫色波浪头部 + 胶囊分段标题", en: "Purple wave header + pill headings" } }, // 图1-左下
  { id: "pro-table",    label: { zh: "深色表格", en: "Dark Header Table" }, description: { zh: "深色头部条 + 表格化经历", en: "Dark header + table-like experience" } }, // 图1-中下
  { id: "playful",      label: { zh: "可爱涂鸦", en: "Cute Doodle" }, description: { zh: "可爱卡片分区 + 插画风装饰", en: "Cute cards + doodle vibe" } }, // 图1-右下
  { id: "flora",        label: { zh: "青绿粉条", en: "Teal/Pink Card" }, description: { zh: "左右彩条 + 中间白卡片", en: "Side bars + central white card" } }, // 图2-左上
  { id: "dark-sidebar", label: { zh: "红侧栏", en: "Red Sidebar" }, description: { zh: "红色侧栏 + 右侧分块信息", en: "Red sidebar + sections on right" } }, // 图2-中上
  { id: "corner-info",  label: { zh: "兔子草地", en: "Bunny Grass" }, description: { zh: "米色背景 + 橙色标题 + 草地装饰", en: "Cream + orange headings + grass decor" } }, // 图2-右上
  { id: "icon-grid",    label: { zh: "棕粉卡片", en: "Brown Pink Cards" }, description: { zh: "棕色名片头 + 粉色卡片分区", en: "Brown header card + pink sections" } }, // 图2-左下
  { id: "bracket",      label: { zh: "网格Q版", en: "Grid Chibi" }, description: { zh: "网格纸背景 + 蓝橙分区", en: "Grid paper + blue/orange sections" } }, // 图2-中下
  { id: "formal-table", label: { zh: "黄色表格", en: "Yellow Table" }, description: { zh: "强结构化表格简历", en: "Structured table resume" } }, // 图2-右下
]

export const PALETTES: PaletteOption[] = [
  { id: "dark-gold", label: "Dark Gold", swatch: "#e5a830", bg: "#0f1114", text: "#e8e3d8", accent: "#e5a830", cardBg: "#16181d", border: "#2a2d35", muted: "#7a7870", headingBg: "#e5a830", headingText: "#0f1114" },
  { id: "clean-blue", label: "Clean Blue", swatch: "#3b82f6", bg: "#ffffff", text: "#1a1a2e", accent: "#3b82f6", cardBg: "#f8fafc", border: "#e2e8f0", muted: "#64748b", headingBg: "#3b82f6", headingText: "#ffffff" },
  { id: "rose", label: "Rose", swatch: "#e84a7a", bg: "#fdf2f4", text: "#1c1017", accent: "#e84a7a", cardBg: "#fff5f7", border: "#f5d0d8", muted: "#9c6b78", headingBg: "#e84a7a", headingText: "#ffffff" },
  { id: "emerald", label: "Emerald", swatch: "#10b981", bg: "#f0fdf4", text: "#0a2618", accent: "#059669", cardBg: "#f8fefb", border: "#bbf7d0", muted: "#5c8a6e", headingBg: "#059669", headingText: "#ffffff" },
  { id: "mono", label: "Mono", swatch: "#404040", bg: "#fafafa", text: "#09090b", accent: "#18181b", cardBg: "#ffffff", border: "#e4e4e7", muted: "#71717a", headingBg: "#18181b", headingText: "#fafafa" },
  { id: "navy", label: "Navy", swatch: "#1e3a5f", bg: "#f1f5f9", text: "#0f172a", accent: "#1e3a5f", cardBg: "#ffffff", border: "#cbd5e1", muted: "#475569", headingBg: "#1e3a5f", headingText: "#ffffff" },
  { id: "sakura", label: "Sakura", swatch: "#e8a0b4", bg: "#fef5f7", text: "#3d1f2b", accent: "#d4778e", cardBg: "#fff0f3", border: "#f2c4d0", muted: "#9e6b7c", headingBg: "#e8a0b4", headingText: "#3d1f2b" },
  { id: "sunset", label: "Sunset", swatch: "#e07630", bg: "#fefaf6", text: "#3b1f0a", accent: "#d4652a", cardBg: "#fff7ee", border: "#f0d4b8", muted: "#9e7352", headingBg: "#e07630", headingText: "#ffffff" },
  { id: "ocean", label: "Ocean", swatch: "#0d9488", bg: "#f0fdfa", text: "#0a2622", accent: "#0f766e", cardBg: "#f0fdfb", border: "#99f6e4", muted: "#4d7c77", headingBg: "#0d9488", headingText: "#ffffff" },
  { id: "lavender", label: "Lavender", swatch: "#8b5cf6", bg: "#faf5ff", text: "#2e1065", accent: "#7c3aed", cardBg: "#f5f0ff", border: "#ddd6fe", muted: "#7c6b9e", headingBg: "#8b5cf6", headingText: "#ffffff" },
]
