"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Icon } from "@iconify/react"
import {
  PALETTES, LAYOUTS, PAPER_SIZES, SOCIAL_PRESETS,
  type LayoutId, type PaletteId, type PaperSize, type PaletteOption, type ResumeData, type CustomSection, type CustomSectionType, type EmailEntry, type SocialLink,
} from "@/lib/resume-templates"
import { ResumeRenderer } from "@/components/resume/resume-renderer"
import { cn } from "@/lib/utils"

// ── Constants ──────────────────────────────────────────────────────────
const LOCAL_KEY = "kjch-diy-resume"
const DEVICE_KEY = "kjch-diy-device-token"
const PROFILE_KEY = "kjch-diy-profile-name"
const SECTIONS_KEY = "kjch-diy-sections-vis"
const SAVE_DEBOUNCE = 5000 // min 5s between server saves

function uuid() {
  return "xxxxxxxx-xxxx-4xxx".replace(/x/g, () => ((Math.random() * 16) | 0).toString(16))
}
function getDeviceToken(): string {
  if (typeof window === "undefined") return ""
  let token = localStorage.getItem(DEVICE_KEY)
  if (!token) { token = uuid(); localStorage.setItem(DEVICE_KEY, token) }
  return token
}

function getDefaultData(): ResumeData {
  return {
    name: { zh: "你的名字", en: "Your Name" },
    tagline: { zh: "你的职位 / 标签", en: "Your Title / Tagline" },
    email: "email@example.com", emails: [], phone: "", website: "", github: "", linkedin: "",
    location: "City, Country", avatar: "", socialLinks: [],
    summary: { zh: "在这里写一段关于你自己的简短介绍...", en: "Write a brief summary about yourself here..." },
    education: [{ school: "Your University", degree: { zh: "学士", en: "Bachelor" }, detail: { zh: "计算机科学", en: "Computer Science" }, period: "2020 - 2024" }],
    experiences: [{ title: { zh: "职位", en: "Position" }, org: { zh: "公司", en: "Company" }, description: { zh: "描述你的工作内容...", en: "Describe your work here..." }, startDate: "2024", icon: "mdi:briefcase-outline" }],
    projects: [{ title: { zh: "项目名称", en: "Project Name" }, description: { zh: "项目描述...", en: "Project description..." }, date: "2024", tags: ["React", "TypeScript"] }],
    skillGroups: [
      { label: { zh: "前端", en: "Frontend" }, items: [{ name: "React" }, { name: "TypeScript" }, { name: "Tailwind CSS" }] },
      { label: { zh: "后端", en: "Backend" }, items: [{ name: "Node.js" }, { name: "Python" }] },
    ],
    customSections: [],
  }
}

// Ensure loaded data has all new fields (backward compat)
function migrateData(d: Partial<ResumeData>): ResumeData {
  const def = getDefaultData()
  return {
    ...def,
    ...d,
    emails: d.emails || [],
    socialLinks: d.socialLinks || [],
    customSections: (d.customSections || []).map((s) => ({
      id: s.id || uuid(),
      title: typeof s.title === "string" ? { zh: s.title, en: s.title } : (s.title || { zh: "", en: "" }),
      icon: s.icon || "mdi:star-outline",
      type: s.type || "list",
      items: s.items || [],
    })),
    education: (d.education || def.education).map((e: Record<string, unknown>) => ({
      school: (e.school as string) || "",
      degree: typeof e.degree === "string" ? { zh: e.degree, en: e.degree } : (e.degree as { zh: string; en: string }) || { zh: "", en: "" },
      detail: typeof e.detail === "string" ? { zh: e.detail, en: e.detail } : (e.detail as { zh: string; en: string }) || { zh: "", en: "" },
      period: (e.period as string) || "",
    })),
  } as ResumeData
}

// ── Section visibility config ────────────────────────────────────────
type BuiltInSection = "basic" | "education" | "experience" | "projects" | "skills"
const ALL_BUILTIN: BuiltInSection[] = ["basic", "education", "experience", "projects", "skills"]

function getDefaultSectionVis(): Record<BuiltInSection, boolean> {
  return { basic: true, education: true, experience: true, projects: true, skills: true }
}

// ── Relative time helper ──────────────────────────────────────────────
function relativeTime(ts: number, locale: "zh" | "en"): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 10) return locale === "zh" ? "刚刚" : "Just now"
  if (diff < 60) return locale === "zh" ? `${diff}秒前` : `${diff}s ago`
  const min = Math.floor(diff / 60)
  if (min < 60) return locale === "zh" ? `${min}分钟前` : `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return locale === "zh" ? `${hr}小时前` : `${hr}h ago`
  const d = new Date(ts)
  return d.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// ── Bilingual labels ───────────────────────────────────────────────────
const t = {
  zh: {
    settings: "设置", hideSettings: "收起", layout: "布局模板", palette: "配色方案",
    icons: "图标", fontSize: "字号", print: "打印", exportPdf: "PDF 预览",
    closePdf: "关闭预览", generating: "生成中...", lang: "EN", backToResume: "返回",
    profile: "云同步", profileName: "简历名称", profileDesc: "设置一个唯一名称来保存和同步你的简历。",
    save: "保存", load: "加载", saving: "同步中...", saved: "已同步", unsaved: "有未保存更改",
    nameRequired: "名称至少需要2个字符", nameTaken: "此名称已被其他用户使用，是否是你的？",
    claimYes: "是我的", claimNo: "不是", loadProfile: "加载配置", loadDesc: "输入你之前设置的简历名称来加载",
    profileNotFound: "未找到该名称的配置文件", loadSuccess: "加载成功！",
    editHint: "点击简历上的各个部分即可编辑",
    basic: "基本信息", education: "教育经历", experience: "经验",
    projects: "项目", skills: "技能", custom: "自定义板块",
    add: "添加", remove: "删除", school: "学校", degree: "学位", detail: "专业/详情",
    period: "时间段", title: "标题", org: "单位", desc: "描述", start: "开始", end: "结束",
    date: "日期", tags: "标签(逗号分隔)", items: "技能(逗号分隔)", group: "分组名",
    sectionTitle: "板块标题", sectionItems: "内容项(回车分隔)", addSection: "添加自定义板块",
    name: "姓名", tagline: "标语/头衔", email: "主邮箱", phone: "电话",
    website: "网站", github: "GitHub", linkedin: "LinkedIn", location: "所在地", avatar: "头像URL",
    summary: "简介", link: "链接",
    reset: "重置", exportJson: "导出JSON", importJson: "导入JSON",
    resetConfirm: "确定重置所有数据？",
    sectionMgr: "板块管理", sectionMgrDesc: "控制显示哪些板块以及管理自定义板块",
    visible: "显示", hidden: "隐藏",
    welcomeTitle: "欢迎使用简历 DIY 工具",
    welcomeDesc: "为你的简历设置一个唯一名称，方便云端保存和跨设备同步。",
    welcomePlaceholder: "例如：zhangsan-resume",
    welcomeStart: "开始制作", welcomeSkip: "暂时跳过",
    syncStatus: "已同步", notSynced: "未配置同步",
    moveUp: "上移", moveDown: "下移", duplicate: "复制此项",
    paper: "纸张", addEmail: "添加邮箱", emailLabel: "用途", emailAddr: "邮箱地址",
    addSocial: "添加社交媒体", socialUrl: "链接地址", iconName: "图标名称",
    sectionType: "内容类型", list: "列表", text: "文本", cards: "卡片", tagsType: "标签",
    sectionIcon: "板块图标", lastSaved: "上次保存",
  },
  en: {
    settings: "Settings", hideSettings: "Hide", layout: "Layout", palette: "Color Palette",
    icons: "Icons", fontSize: "Font Size", print: "Print", exportPdf: "PDF Preview",
    closePdf: "Close Preview", generating: "Generating...", lang: "中文", backToResume: "Back",
    profile: "Cloud Sync", profileName: "Resume Name", profileDesc: "Set a unique name to save and sync your resume.",
    save: "Save", load: "Load", saving: "Syncing...", saved: "Synced", unsaved: "Unsaved changes",
    nameRequired: "Name must be at least 2 characters", nameTaken: "This name is already taken. Is it yours?",
    claimYes: "Yes, it's mine", claimNo: "No", loadProfile: "Load Profile", loadDesc: "Enter your resume name to load",
    profileNotFound: "Profile not found with that name", loadSuccess: "Loaded successfully!",
    editHint: "Click any section on the resume to edit it",
    basic: "Basic Info", education: "Education", experience: "Experience",
    projects: "Projects", skills: "Skills", custom: "Custom Sections",
    add: "Add", remove: "Remove", school: "School", degree: "Degree", detail: "Major / Detail",
    period: "Period", title: "Title", org: "Organization", desc: "Description", start: "Start", end: "End",
    date: "Date", tags: "Tags (comma-separated)", items: "Skills (comma-separated)", group: "Group Name",
    sectionTitle: "Section Title", sectionItems: "Items (one per line)", addSection: "Add Custom Section",
    name: "Name", tagline: "Tagline / Title", email: "Primary Email", phone: "Phone",
    website: "Website", github: "GitHub", linkedin: "LinkedIn", location: "Location", avatar: "Avatar URL",
    summary: "Summary", link: "Link",
    reset: "Reset", exportJson: "Export JSON", importJson: "Import JSON",
    resetConfirm: "Reset all data?",
    sectionMgr: "Section Manager", sectionMgrDesc: "Control which sections are visible and manage custom sections",
    visible: "Visible", hidden: "Hidden",
    welcomeTitle: "Welcome to Resume DIY",
    welcomeDesc: "Set a unique name for your resume to enable cloud save and cross-device sync.",
    welcomePlaceholder: "e.g.: john-doe-resume",
    welcomeStart: "Start Building", welcomeSkip: "Skip for now",
    syncStatus: "Synced", notSynced: "Not synced",
    moveUp: "Move Up", moveDown: "Move Down", duplicate: "Duplicate",
    paper: "Paper", addEmail: "Add Email", emailLabel: "Label", emailAddr: "Email Address",
    addSocial: "Add Social Media", socialUrl: "URL", iconName: "Icon Name",
    sectionType: "Content Type", list: "List", text: "Text", cards: "Cards", tagsType: "Tags",
    sectionIcon: "Section Icon", lastSaved: "Last saved",
  },
}

const SEC_TYPE_OPTIONS: { id: CustomSectionType; icon: string }[] = [
  { id: "list", icon: "mdi:format-list-bulleted" },
  { id: "text", icon: "mdi:text" },
  { id: "cards", icon: "mdi:card-outline" },
  { id: "tags", icon: "mdi:tag-outline" },
]

// ── Reusable input components ──────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-0.5 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{children}</label>
}
function TextInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <input className={cn("w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30", className)} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
}
function BiField({ label, value, onChange }: { label: string; value: { zh: string; en: string }; onChange: (v: { zh: string; en: string }) => void }) {
  // Safely handle old string values from localStorage
  const safeVal = typeof value === "string" ? { zh: value, en: value } : (value || { zh: "", en: "" })
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-1.5">
        <TextInput value={safeVal.zh} onChange={(v) => onChange({ ...safeVal, zh: v })} placeholder="中文" />
        <TextInput value={safeVal.en} onChange={(v) => onChange({ ...safeVal, en: v })} placeholder="English" />
      </div>
    </div>
  )
}
function BiArea({ label, value, onChange, rows = 3 }: { label: string; value: { zh: string; en: string }; onChange: (v: { zh: string; en: string }) => void; rows?: number }) {
  const safeVal = typeof value === "string" ? { zh: value, en: value } : (value || { zh: "", en: "" })
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-1.5">
        <textarea className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" rows={rows} placeholder="中文" value={safeVal.zh} onChange={(e) => onChange({ ...safeVal, zh: e.target.value })} />
        <textarea className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" rows={rows} placeholder="English" value={safeVal.en} onChange={(e) => onChange({ ...safeVal, en: e.target.value })} />
      </div>
    </div>
  )
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <div><FieldLabel>{label}</FieldLabel><TextInput value={value} onChange={onChange} placeholder={placeholder} /></div>
}

// ── Welcome modal (first-time setup, handles duplicate names) ─────────
function WelcomeModal({ locale, onDone, onSkip, onLoadExisting }: { locale: "zh" | "en"; onDone: (name: string) => void; onSkip: () => void; onLoadExisting: (name: string) => void }) {
  const l = t[locale]
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showClaimPrompt, setShowClaimPrompt] = useState(false)

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) { setError(l.nameRequired); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/resume-profiles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileName: trimmed, resumeData: getDefaultData(), layout: "classic", palette: "clean-blue", showIcons: true, fontScale: 100, locale, deviceToken: getDeviceToken() }),
      })
      const data = await res.json()
      if (data.success) { onDone(trimmed) }
      else if (data.error === "name_taken") {
        // Show claim prompt instead of just error
        setShowClaimPrompt(true)
        setError("")
      }
      else { setError(data.message || "Error") }
    } catch { setError("Network error") }
    setLoading(false)
  }

  const handleClaim = () => {
    // Load from server and link this device
    onLoadExisting(name.trim())
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-1 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><Icon icon="mdi:cloud-check-outline" className="h-5 w-5 text-primary" /></div>
          <h2 className="text-sm font-bold text-foreground">{l.welcomeTitle}</h2>
        </div>
        <p className="mb-4 mt-2 text-[11px] leading-relaxed text-muted-foreground">{l.welcomeDesc}</p>
        <div className="mb-3"><TextInput value={name} onChange={(v) => { setName(v); setShowClaimPrompt(false); setError("") }} placeholder={l.welcomePlaceholder} className="!py-2.5 !text-sm" /></div>
        {error && <p className="mb-2 text-[11px] text-destructive">{error}</p>}

        {showClaimPrompt ? (
          <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="mb-2 text-[11px] leading-relaxed text-foreground">
              {locale === "zh"
                ? `"${name.trim()}" 已存在。如果这是你的简历，可以直接加载数据到本设备。`
                : `"${name.trim()}" already exists. If this is yours, you can load it to this device.`}
            </p>
            <div className="flex gap-2">
              <button onClick={handleClaim} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90">
                <Icon icon="mdi:cloud-download" className="h-3.5 w-3.5" />{locale === "zh" ? "加载到本设备" : "Load to this device"}
              </button>
              <button onClick={() => { setShowClaimPrompt(false); setName("") }} className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
                {locale === "zh" ? "换个名字" : "Use different name"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              {loading ? <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> : <Icon icon="mdi:check" className="h-4 w-4" />}{l.welcomeStart}
            </button>
            <button onClick={onSkip} className="rounded-xl border border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground">{l.welcomeSkip}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Profile Modal ──────────────────────────────────────────────────────
function ProfileModal({ open, onClose, locale, profileName, setProfileName, onSaveServer, onLoadServer, status }: {
  open: boolean; onClose: () => void; locale: "zh" | "en"; profileName: string; setProfileName: (v: string) => void
  onSaveServer: () => void; onLoadServer: (name: string) => void; status: string
}) {
  const l = t[locale]
  const [loadName, setLoadName] = useState("")
  const [tab, setTab] = useState<"save" | "load">("save")
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><Icon icon="mdi:cloud-outline" className="h-4 w-4 text-primary" />{l.profile}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground"><Icon icon="mdi:close" className="h-4 w-4" /></button>
        </div>
        <div className="mb-4 flex gap-1 rounded-xl bg-secondary/50 p-1">
          {(["save", "load"] as const).map((id) => (
            <button key={id} onClick={() => setTab(id)} className={cn("flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors", tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{id === "save" ? l.save : l.load}</button>
          ))}
        </div>
        {tab === "save" && (
          <div className="space-y-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{l.profileDesc}</p>
            <div><FieldLabel>{l.profileName}</FieldLabel><TextInput value={profileName} onChange={setProfileName} placeholder="my-resume-2024" /></div>
            {status && <p className={cn("text-[11px]", status.includes("!") || status.includes("success") || status.includes("成功") ? "text-emerald-500" : "text-destructive")}>{status}</p>}
            <button onClick={onSaveServer} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"><Icon icon="mdi:cloud-upload-outline" className="h-4 w-4" />{l.save}</button>
          </div>
        )}
        {tab === "load" && (
          <div className="space-y-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{l.loadDesc}</p>
            <div><FieldLabel>{l.profileName}</FieldLabel><TextInput value={loadName} onChange={setLoadName} placeholder="my-resume-2024" /></div>
            {status && <p className={cn("text-[11px]", status.includes("!") || status.includes("success") || status.includes("成功") ? "text-emerald-500" : "text-destructive")}>{status}</p>}
            <button onClick={() => onLoadServer(loadName)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"><Icon icon="mdi:cloud-download-outline" className="h-4 w-4" />{l.load}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PDF Preview Modal ─────────────────────────────────────────────────

// Extract text positions from DOM for invisible PDF text layer
function extractTextPositions(container: HTMLElement) {
  const result: { text: string; x: number; y: number; fontSize: number; width: number }[] = []
  const cRect = container.getBoundingClientRect()
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT
      const p = node.parentElement
      if (!p) return NodeFilter.FILTER_REJECT
      const s = window.getComputedStyle(p)
      if (s.display === "none" || s.visibility === "hidden") return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let n: Node | null
  while ((n = walker.nextNode())) {
    const text = n.textContent?.trim()
    if (!text) continue
    const parent = n.parentElement!
    const fontSize = parseFloat(window.getComputedStyle(parent).fontSize) || 12
    const range = document.createRange()
    range.selectNodeContents(n)
    const rects = range.getClientRects()
    // For each line rect the text occupies
    for (const r of Array.from(rects)) {
      if (r.width < 1 || r.height < 1) continue
      result.push({
        text,
        x: r.left - cRect.left,
        y: r.top - cRect.top,
        fontSize,
        width: r.width || parent.getBoundingClientRect().width,
      })
      break // use first rect only (avoid duplicates for wrapped text)
    }
  }
  return result
}

function PdfPreviewModal({ open, onClose, locale, data, palette, layout, showIcons, fontScale, paper, paperSize, resumeName }: {
  open: boolean; onClose: () => void; locale: "zh" | "en"
  data: ResumeData; palette: PaletteOption; layout: LayoutId
  showIcons: boolean; fontScale: number
  paper: { w: number; h: number }; paperSize: PaperSize; resumeName: string
}) {
  const l = t[locale]
  const previewRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Direct PDF download: image layer for visuals + invisible text layer for selectability
  const handleDownload = useCallback(async () => {
    if (!previewRef.current || downloading) return
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")
      const el = previewRef.current

      // 1. Extract text positions from live DOM (before any style changes)
      const textItems = extractTextPositions(el)
      const elW = el.offsetWidth
      const elH = el.offsetHeight

      // 2. Render image layer
      const prevRadius = el.style.borderRadius
      el.style.borderRadius = "0"
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: palette.bg })
      el.style.borderRadius = prevRadius

      const imgData = canvas.toDataURL("image/png")
      const pdfW = paperSize === "a4" ? 210 : 215.9
      const pdfH = paperSize === "a4" ? 297 : 279.4
      const imgH = (canvas.height * pdfW) / canvas.width
      const finalH = Math.max(pdfH, imgH)
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfW, finalH] })

      // Add image as visual background
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH)

      // 3. Add invisible text layer on top for copy/search
      const sx = pdfW / elW // mm per CSS-px (horizontal)
      const sy = imgH / elH // mm per CSS-px (vertical)
      const PT_PER_MM = 72 / 25.4

      textItems.forEach(({ text, x, y, fontSize, width }) => {
        const pdfFontSize = Math.max(1, Math.min(72, fontSize * sx * PT_PER_MM))
        const pdfX = x * sx
        const pdfY = y * sy + fontSize * sy * 0.78 // approximate baseline
        const pdfMaxW = width * sx
        pdf.setFontSize(pdfFontSize)
        // Tr=3 means invisible text (not stroked, not filled) but still selectable
        ;(pdf.internal as unknown as { write: (s: string) => void }).write("3 Tr")
        pdf.text(text, pdfX, pdfY, { maxWidth: pdfMaxW > 0 ? pdfMaxW : undefined })
        ;(pdf.internal as unknown as { write: (s: string) => void }).write("0 Tr")
      })

      const fileName = `${resumeName || "resume"}-${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)
    } catch (err) { console.error("PDF download failed", err) }
    setDownloading(false)
  }, [downloading, palette.bg, paperSize, resumeName])

  // Print via hidden iframe (text-based, supports text selection in print)
  const handlePrint = useCallback(() => {
    if (!previewRef.current) return
    const iframe = document.createElement("iframe")
    iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:0;height:0;border:none;visibility:hidden"
    document.body.appendChild(iframe)
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) { document.body.removeChild(iframe); return }

    const styleEls = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML).join("\n")
    const htmlCls = document.documentElement.getAttribute("class") || ""
    const htmlStyle = document.documentElement.getAttribute("style") || ""
    const resumeHtml = previewRef.current.innerHTML

    iframeDoc.open()
    iframeDoc.write(`<!DOCTYPE html><html class="${htmlCls}" style="${htmlStyle}"><head><meta charset="utf-8">
${styleEls}
<style>
  @page { size: ${paperSize === "a4" ? "A4" : "letter"}; margin: 10mm 8mm; }
  html, body { margin: 0 !important; padding: 0 !important; }
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .resume-print-root { width: ${paper.w}px; min-height: ${paper.h}px; background: ${palette.bg}; overflow: visible; display: flex; flex-direction: column; }
</style>
</head><body><div class="resume-print-root">${resumeHtml}</div></body></html>`)
    iframeDoc.close()

    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      const cleanup = () => { try { document.body.removeChild(iframe) } catch {} }
      if (iframe.contentWindow) { iframe.contentWindow.onafterprint = cleanup }
      setTimeout(cleanup, 60000)
    }, 800)
  }, [palette.bg, paper.w, paper.h, paperSize])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-sm font-bold text-white">{l.exportPdf}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
            <Icon icon={downloading ? "mdi:loading" : "mdi:download"} className={cn("h-3.5 w-3.5", downloading && "animate-spin")} />
            {downloading ? (locale === "zh" ? "生成中..." : "Generating...") : (locale === "zh" ? "下载 PDF" : "Download PDF")}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20">
            <Icon icon="mdi:printer-outline" className="h-3.5 w-3.5" />{locale === "zh" ? "打印" : "Print"}
          </button>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20">{l.closePdf}</button>
        </div>
      </div>
      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto" style={{ width: paper.w, maxWidth: "100%" }}>
          <div ref={previewRef} className="mx-auto overflow-hidden rounded-lg shadow-2xl" style={{ width: paper.w, minHeight: paper.h, maxWidth: "100%", background: palette.bg }}>
            <div style={{ minHeight: paper.h, display: 'flex', flexDirection: 'column' }}>
              <ResumeRenderer data={data} palette={palette} layout={layout} locale={locale} showIcons={showIcons} fontScale={fontScale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section Editor Panel ──────────────────────────────────────────────
type EditSection = "basic" | "education" | "experience" | "projects" | "skills" | "custom" | "sections" | null

function SectionEditor({ section, data, update, locale, onClose, sectionVis, setSectionVis }: {
  section: EditSection; data: ResumeData; update: (fn: (d: ResumeData) => ResumeData) => void; locale: "zh" | "en"; onClose: () => void
  sectionVis: Record<BuiltInSection, boolean>; setSectionVis: (v: Record<BuiltInSection, boolean>) => void
}) {
  const l = t[locale]
  if (!section) return null

  const sectionLabel: Record<string, string> = {
    basic: l.basic, education: l.education, experience: l.experience,
    projects: l.projects, skills: l.skills, custom: l.custom, sections: l.sectionMgr,
  }

  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    const next = [...arr]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next
  }
  function ItemActions({ index, total, onMove, onRemove, onDuplicate }: { index: number; total: number; onMove: (from: number, to: number) => void; onRemove: () => void; onDuplicate?: () => void }) {
    return (
      <div className="flex items-center gap-1">
        {onDuplicate && <button onClick={onDuplicate} title={l.duplicate} className="rounded p-0.5 text-muted-foreground transition-colors hover:text-primary"><Icon icon="mdi:content-copy" className="h-3 w-3" /></button>}
        <button disabled={index === 0} onClick={() => onMove(index, index - 1)} title={l.moveUp} className="rounded p-0.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-30"><Icon icon="mdi:chevron-up" className="h-3.5 w-3.5" /></button>
        <button disabled={index === total - 1} onClick={() => onMove(index, index + 1)} title={l.moveDown} className="rounded p-0.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-30"><Icon icon="mdi:chevron-down" className="h-3.5 w-3.5" /></button>
        <button onClick={onRemove} className="rounded p-0.5 text-destructive/70 transition-colors hover:text-destructive"><Icon icon="mdi:trash-can-outline" className="h-3 w-3" /></button>
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card/95 backdrop-blur-md sm:w-[380px] md:w-[420px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">{sectionLabel[section] || section}</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon icon="mdi:close" className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* ── Section Manager ──────────────────────── */}
        {section === "sections" && (
          <div className="space-y-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{l.sectionMgrDesc}</p>
            <div className="space-y-2">
              {ALL_BUILTIN.map((sec) => {
                const icons: Record<string, string> = { basic: "mdi:account-outline", education: "mdi:school-outline", experience: "mdi:briefcase-outline", projects: "mdi:folder-outline", skills: "mdi:code-tags" }
                return (
                  <div key={sec} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
                    <div className="flex items-center gap-2.5"><Icon icon={icons[sec]} className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-foreground">{sectionLabel[sec]}</span></div>
                    <button onClick={() => setSectionVis({ ...sectionVis, [sec]: !sectionVis[sec] })} className={cn("rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors", sectionVis[sec] ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>{sectionVis[sec] ? l.visible : l.hidden}</button>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{l.custom}</p>
              {(data.customSections || []).map((sec, i) => (
                <div key={sec.id} className="mb-2 flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5">
                  <div className="flex items-center gap-2.5"><Icon icon={sec.icon || "mdi:puzzle-outline"} className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-foreground">{sec.title[locale]}</span></div>
                  <button onClick={() => update((d) => ({ ...d, customSections: (d.customSections || []).filter((_, j) => j !== i) }))} className="rounded p-0.5 text-destructive/70 transition-colors hover:text-destructive"><Icon icon="mdi:trash-can-outline" className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button onClick={() => update((d) => ({ ...d, customSections: [...(d.customSections || []), { id: uuid(), title: { zh: "自定义板块", en: "Custom Section" }, icon: "mdi:star-outline", type: "list" as CustomSectionType, items: [""] }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/5"><Icon icon="mdi:plus" className="h-4 w-4" />{l.addSection}</button>
            </div>
          </div>
        )}

        {/* ── Basic Info ──────────────────────────── */}
        {section === "basic" && (
          <div className="space-y-3">
            <BiField label={l.name} value={data.name} onChange={(v) => update((d) => ({ ...d, name: v }))} />
            <Field label={locale === "zh" ? "昵称 (可选)" : "Nickname (optional)"} value={data.nickname || ""} onChange={(v) => update((d) => ({ ...d, nickname: v || undefined }))} placeholder={locale === "zh" ? "例如: 小明" : "e.g.: JD"} />
            <BiField label={l.tagline} value={data.tagline} onChange={(v) => update((d) => ({ ...d, tagline: v }))} />
            <Field label={l.email} value={data.email} onChange={(v) => update((d) => ({ ...d, email: v }))} />

            {/* Multi-email */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel>{l.addEmail}</FieldLabel>
                <button onClick={() => update((d) => ({ ...d, emails: [...(d.emails || []), { label: "", address: "" }] }))} className="rounded p-0.5 text-primary hover:text-primary/80"><Icon icon="mdi:plus-circle-outline" className="h-3.5 w-3.5" /></button>
              </div>
              {(data.emails || []).map((em, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input className="w-20 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground" placeholder={locale === "zh" ? "用途" : "Label"} value={em.label} onChange={(e) => update((d) => ({ ...d, emails: (d.emails || []).map((x, j) => j === i ? { ...x, label: e.target.value } : x) }))} />
                  <input className="flex-1 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground" placeholder="email@..." value={em.address} onChange={(e) => update((d) => ({ ...d, emails: (d.emails || []).map((x, j) => j === i ? { ...x, address: e.target.value } : x) }))} />
                  <button onClick={() => update((d) => ({ ...d, emails: (d.emails || []).filter((_, j) => j !== i) }))} className="rounded p-0.5 text-destructive/70 hover:text-destructive"><Icon icon="mdi:close" className="h-3 w-3" /></button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label={l.phone} value={data.phone} onChange={(v) => update((d) => ({ ...d, phone: v }))} placeholder="+1 234 567 890" />
              <Field label={l.location} value={data.location} onChange={(v) => update((d) => ({ ...d, location: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={l.website} value={data.website} onChange={(v) => update((d) => ({ ...d, website: v }))} />
              <Field label={l.github} value={data.github} onChange={(v) => update((d) => ({ ...d, github: v }))} />
            </div>
            <Field label={l.linkedin} value={data.linkedin} onChange={(v) => update((d) => ({ ...d, linkedin: v }))} />

            {/* Social media */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel>{l.addSocial}</FieldLabel>
                <button onClick={() => update((d) => ({ ...d, socialLinks: [...(d.socialLinks || []), { platform: "", icon: "mdi:link", url: "" }] }))} className="rounded p-0.5 text-primary hover:text-primary/80"><Icon icon="mdi:plus-circle-outline" className="h-3.5 w-3.5" /></button>
              </div>
              {/* Quick-add presets */}
              <div className="flex flex-wrap gap-1">
                {SOCIAL_PRESETS.map((p) => (
                  <button key={p.platform} onClick={() => update((d) => ({ ...d, socialLinks: [...(d.socialLinks || []), { platform: p.platform, icon: p.icon, url: "" }] }))} className="rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground transition-colors hover:border-primary hover:text-primary" title={p.platform}>
                    <Icon icon={p.icon} className="h-3 w-3 inline mr-0.5" />{p.platform}
                  </button>
                ))}
              </div>
              {(data.socialLinks || []).map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 rounded border border-border bg-secondary/50 px-1.5 py-1">
                    <Icon icon={s.icon || "mdi:link"} className="h-3 w-3 text-primary" />
                    <input className="w-14 bg-transparent text-[9px] text-foreground outline-none" placeholder="icon" value={s.icon} onChange={(e) => update((d) => ({ ...d, socialLinks: (d.socialLinks || []).map((x, j) => j === i ? { ...x, icon: e.target.value } : x) }))} />
                  </div>
                  <input className="w-16 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground" placeholder="Platform" value={s.platform} onChange={(e) => update((d) => ({ ...d, socialLinks: (d.socialLinks || []).map((x, j) => j === i ? { ...x, platform: e.target.value } : x) }))} />
                  <input className="flex-1 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground" placeholder="https://..." value={s.url} onChange={(e) => update((d) => ({ ...d, socialLinks: (d.socialLinks || []).map((x, j) => j === i ? { ...x, url: e.target.value } : x) }))} />
                  <button onClick={() => update((d) => ({ ...d, socialLinks: (d.socialLinks || []).filter((_, j) => j !== i) }))} className="rounded p-0.5 text-destructive/70 hover:text-destructive"><Icon icon="mdi:close" className="h-3 w-3" /></button>
                </div>
              ))}
            </div>

            <Field label={l.avatar} value={data.avatar} onChange={(v) => update((d) => ({ ...d, avatar: v }))} placeholder="https://..." />
            <BiArea label={l.summary} value={data.summary} onChange={(v) => update((d) => ({ ...d, summary: v }))} rows={4} />
          </div>
        )}

        {/* ── Education ──────────────────────────── */}
        {section === "education" && (
          <div className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">#{i + 1}</span>
                  <ItemActions index={i} total={data.education.length}
                    onMove={(from, to) => update((d) => ({ ...d, education: moveItem(d.education, from, to) }))}
                    onRemove={() => update((d) => ({ ...d, education: d.education.filter((_, j) => j !== i) }))}
                    onDuplicate={() => update((d) => ({ ...d, education: [...d.education.slice(0, i + 1), JSON.parse(JSON.stringify(edu)), ...d.education.slice(i + 1)] }))} />
                </div>
                <Field label={l.school} value={edu.school} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, school: v } : e) }))} />
                <BiField label={l.degree} value={typeof edu.degree === "string" ? { zh: edu.degree, en: edu.degree } : (edu.degree || { zh: "", en: "" })} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, degree: v } : e) }))} />
                <BiField label={l.detail} value={typeof edu.detail === "string" ? { zh: edu.detail, en: edu.detail } : (edu.detail || { zh: "", en: "" })} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, detail: v } : e) }))} />
                <Field label={l.period} value={edu.period} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, period: v } : e) }))} placeholder="2020 - 2024" />
              </div>
            ))}
            <button onClick={() => update((d) => ({ ...d, education: [...d.education, { school: "", degree: { zh: "", en: "" }, detail: { zh: "", en: "" }, period: "" }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/5"><Icon icon="mdi:plus" className="h-4 w-4" />{l.add}</button>
          </div>
        )}

        {/* ── Experience ─────────────────────────── */}
        {section === "experience" && (
          <div className="space-y-3">
            {data.experiences.map((exp, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">#{i + 1}</span>
                  <ItemActions index={i} total={data.experiences.length}
                    onMove={(from, to) => update((d) => ({ ...d, experiences: moveItem(d.experiences, from, to) }))}
                    onRemove={() => update((d) => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))}
                    onDuplicate={() => update((d) => ({ ...d, experiences: [...d.experiences.slice(0, i + 1), JSON.parse(JSON.stringify(exp)), ...d.experiences.slice(i + 1)] }))} />
                </div>
                <BiField label={l.title} value={exp.title} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, title: v } : e) }))} />
                <BiField label={l.org} value={exp.org} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, org: v } : e) }))} />
                <BiArea label={l.desc} value={exp.description} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, description: v } : e) }))} rows={3} />
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label={l.start} value={exp.startDate} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, startDate: v } : e) }))} />
                  <Field label={l.end} value={exp.endDate || ""} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, endDate: v || undefined } : e) }))} placeholder="Present" />
                </div>
              </div>
            ))}
            <button onClick={() => update((d) => ({ ...d, experiences: [...d.experiences, { title: { zh: "", en: "" }, org: { zh: "", en: "" }, description: { zh: "", en: "" }, startDate: "" }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/5"><Icon icon="mdi:plus" className="h-4 w-4" />{l.add}</button>
          </div>
        )}

        {/* ── Projects ───────────────────────────── */}
        {section === "projects" && (
          <div className="space-y-3">
            {data.projects.map((proj, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">#{i + 1}</span>
                  <ItemActions index={i} total={data.projects.length}
                    onMove={(from, to) => update((d) => ({ ...d, projects: moveItem(d.projects, from, to) }))}
                    onRemove={() => update((d) => ({ ...d, projects: d.projects.filter((_, j) => j !== i) }))}
                    onDuplicate={() => update((d) => ({ ...d, projects: [...d.projects.slice(0, i + 1), JSON.parse(JSON.stringify(proj)), ...d.projects.slice(i + 1)] }))} />
                </div>
                <BiField label={l.title} value={proj.title} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, title: v } : p) }))} />
                <BiArea label={l.desc} value={proj.description} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, description: v } : p) }))} rows={3} />
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label={l.date} value={proj.date} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, date: v } : p) }))} />
                  <Field label={l.link} value={proj.link || ""} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, link: v || undefined } : p) }))} placeholder="https://..." />
                </div>
                <Field label={l.tags} value={proj.tags.join(", ")} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, tags: v.split(",").map((x) => x.trim()).filter(Boolean) } : p) }))} />
              </div>
            ))}
            <button onClick={() => update((d) => ({ ...d, projects: [...d.projects, { title: { zh: "", en: "" }, description: { zh: "", en: "" }, date: "", tags: [] }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/5"><Icon icon="mdi:plus" className="h-4 w-4" />{l.add}</button>
          </div>
        )}

        {/* ── Skills ─────────────────────────────── */}
        {section === "skills" && (
          <div className="space-y-3">
            {data.skillGroups.map((group, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">#{i + 1}</span>
                  <ItemActions index={i} total={data.skillGroups.length}
                    onMove={(from, to) => update((d) => ({ ...d, skillGroups: moveItem(d.skillGroups, from, to) }))}
                    onRemove={() => update((d) => ({ ...d, skillGroups: d.skillGroups.filter((_, j) => j !== i) }))} />
                </div>
                <BiField label={l.group} value={group.label} onChange={(v) => update((d) => ({ ...d, skillGroups: d.skillGroups.map((g, j) => j === i ? { ...g, label: v } : g) }))} />
                <Field label={l.items} value={group.items.map((s) => s.name).join(", ")} onChange={(v) => update((d) => ({ ...d, skillGroups: d.skillGroups.map((g, j) => j === i ? { ...g, items: v.split(",").map((s) => ({ name: s.trim() })).filter((s) => s.name) } : g) }))} />
              </div>
            ))}
            <button onClick={() => update((d) => ({ ...d, skillGroups: [...d.skillGroups, { label: { zh: "", en: "" }, items: [] }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/5"><Icon icon="mdi:plus" className="h-4 w-4" />{l.add}</button>
          </div>
        )}

        {/* ── Custom Sections ────────────────────── */}
        {section === "custom" && (
          <div className="space-y-3">
            {(data.customSections || []).map((sec, i) => (
              <div key={sec.id} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">#{i + 1}</span>
                  <ItemActions index={i} total={(data.customSections || []).length}
                    onMove={(from, to) => update((d) => ({ ...d, customSections: moveItem(d.customSections || [], from, to) }))}
                    onRemove={() => update((d) => ({ ...d, customSections: (d.customSections || []).filter((_, j) => j !== i) }))} />
                </div>
                <BiField label={l.sectionTitle} value={sec.title} onChange={(v) => update((d) => ({ ...d, customSections: (d.customSections || []).map((s, j) => j === i ? { ...s, title: v } : s) }))} />

                {/* Icon field */}
                <div>
                  <FieldLabel>{l.sectionIcon}</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/50"><Icon icon={sec.icon || "mdi:star-outline"} className="h-4 w-4 text-primary" /></div>
                    <TextInput value={sec.icon || ""} onChange={(v) => update((d) => ({ ...d, customSections: (d.customSections || []).map((s, j) => j === i ? { ...s, icon: v } : s) }))} placeholder="mdi:star-outline" />
                  </div>
                </div>

                {/* Content type picker */}
                <div>
                  <FieldLabel>{l.sectionType}</FieldLabel>
                  <div className="flex gap-1">
                    {SEC_TYPE_OPTIONS.map((opt) => (
                      <button key={opt.id} onClick={() => update((d) => ({ ...d, customSections: (d.customSections || []).map((s, j) => j === i ? { ...s, type: opt.id } : s) }))}
                        className={cn("flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors", sec.type === opt.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                        <Icon icon={opt.icon} className="h-3 w-3" />{l[opt.id === "tags" ? "tagsType" : opt.id]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual item editors based on type */}
                <div>
                  <FieldLabel>{l.sectionItems}</FieldLabel>
                  <div className="space-y-1.5">
                    {sec.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-1.5">
                        <span className="text-[9px] text-muted-foreground w-4 shrink-0 text-center">{itemIdx + 1}</span>
                        <input
                          className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder={sec.type === "cards" ? (locale === "zh" ? "卡片内容..." : "Card content...") : sec.type === "tags" ? (locale === "zh" ? "标签..." : "Tag...") : (locale === "zh" ? "内容项..." : "Item...")}
                          value={item}
                          onChange={(e) => update((d) => ({ ...d, customSections: (d.customSections || []).map((s, j) => j === i ? { ...s, items: s.items.map((it, k) => k === itemIdx ? e.target.value : it) } : s) }))}
                        />
                        <button onClick={() => update((d) => ({ ...d, customSections: (d.customSections || []).map((s, j) => j === i ? { ...s, items: s.items.filter((_, k) => k !== itemIdx) } : s) }))} className="rounded p-0.5 text-destructive/70 hover:text-destructive shrink-0"><Icon icon="mdi:close" className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => update((d) => ({ ...d, customSections: (d.customSections || []).map((s, j) => j === i ? { ...s, items: [...s.items, ""] } : s) }))} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-[10px] text-primary transition-colors hover:border-primary hover:bg-primary/5">
                      <Icon icon="mdi:plus" className="h-3 w-3" />{locale === "zh" ? `添加${sec.type === "cards" ? "卡片" : sec.type === "tags" ? "标签" : "项目"}` : `Add ${sec.type === "cards" ? "card" : sec.type === "tags" ? "tag" : "item"}`}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => update((d) => ({ ...d, customSections: [...(d.customSections || []), { id: uuid(), title: { zh: "自定义板块", en: "Custom Section" }, icon: "mdi:star-outline", type: "list" as CustomSectionType, items: [""] }] }))} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/5"><Icon icon="mdi:plus" className="h-4 w-4" />{l.addSection}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// ── Main Page ────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════
export default function DIYResumePage() {
  const [locale, setLocale] = useState<"zh" | "en">("en")
  const [layout, setLayout] = useState<LayoutId>("classic")
  const [paletteId, setPaletteId] = useState<PaletteId>("clean-blue")
  const [showIcons, setShowIcons] = useState(true)
  const [fontScale, setFontScale] = useState(100)
  const [paperSize, setPaperSize] = useState<PaperSize>("letter")
  const [data, setData] = useState<ResumeData>(getDefaultData)
  const [sectionVis, setSectionVis] = useState<Record<BuiltInSection, boolean>>(getDefaultSectionVis)

  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [activeSection, setActiveSection] = useState<EditSection>(null)
  const [profileName, setProfileName] = useState("")
  const [profileModal, setProfileModal] = useState(false)
  const [profileStatus, setProfileStatus] = useState("")
  const [saveIndicator, setSaveIndicator] = useState<"idle" | "saving" | "saved" | "dirty">("idle")
  const [lastSavedTs, setLastSavedTs] = useState<number>(0)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [mounted, setMounted] = useState(false)
  const resumeRef = useRef<HTMLDivElement>(null)
  const lastServerSave = useRef(0)
  const isDirty = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Force re-render for relative time
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!lastSavedTs) return
    const iv = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(iv)
  }, [lastSavedTs])

  const l = t[locale]
  const palette = PALETTES.find((p) => p.id === paletteId) || PALETTES[1]
  const paper = PAPER_SIZES[paperSize]

  // ── Mount: load from localStorage then try server ──────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY)
      if (saved) setData(migrateData(JSON.parse(saved)))
      const savedSections = localStorage.getItem(SECTIONS_KEY)
      if (savedSections) setSectionVis(JSON.parse(savedSections))
    } catch {}

    const savedProfile = localStorage.getItem(PROFILE_KEY) || ""
    setProfileName(savedProfile)

    const token = getDeviceToken()
    fetch(`/api/resume-profiles?deviceToken=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.found && res.profile) {
          const p = res.profile
          try {
            const d = migrateData(typeof p.resume_data === "string" ? JSON.parse(p.resume_data) : p.resume_data)
            setData(d); setLayout(p.layout || "classic"); setPaletteId(p.palette || "clean-blue")
            setShowIcons(p.show_icons !== false); setFontScale(p.font_scale || 100)
            setLocale(p.locale || "en"); setProfileName(p.profile_name || "")
            localStorage.setItem(LOCAL_KEY, JSON.stringify(d))
            localStorage.setItem(PROFILE_KEY, p.profile_name || "")
            setLastSavedTs(Date.now())
          } catch {}
        } else if (!savedProfile) {
          setShowWelcome(true)
        }
      })
      .catch(() => { if (!savedProfile) setShowWelcome(true) })

    setMounted(true)
  }, [])

  // ── Persist sectionVis ─────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(sectionVis)) } catch {}
  }, [sectionVis, mounted])

  // ── Update helper (marks dirty) ────────────────────────────────
  const update = useCallback((fn: (d: ResumeData) => ResumeData) => {
    setData((prev) => {
      const next = fn(prev)
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    isDirty.current = true
    setSaveIndicator("dirty")

    // Debounced auto-save
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      isDirty.current = false
      triggerServerSave()
    }, SAVE_DEBOUNCE)
  }, [])

  // ── Server save (respects rate limit) ──────────────────────────
  const triggerServerSave = useCallback(() => {
    const pName = localStorage.getItem(PROFILE_KEY) || ""
    if (!pName || pName.length < 2) return
    const now = Date.now()
    if (now - lastServerSave.current < SAVE_DEBOUNCE) return
    lastServerSave.current = now
    setSaveIndicator("saving")

    // Read latest data from localStorage to avoid stale closure
    let latestData: ResumeData
    try { latestData = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}") } catch { return }

    fetch("/api/resume-profiles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileName: pName, resumeData: latestData, layout, palette: paletteId, showIcons, fontScale, locale, deviceToken: getDeviceToken(), lastSavedTs: lastSavedTs }),
    })
      .then((r) => r.json().then((d: any) => ({ status: r.status, data: d })))
      .then(({ status, data: res }) => {
        if (res.success) {
          setSaveIndicator("saved"); setLastSavedTs(res.updatedAt || Date.now())
          setTimeout(() => { if (!isDirty.current) setSaveIndicator("idle") }, 2000)
        } else if (res.error === "conflict" && res.serverProfile) {
          // Server has newer data - prompt user
          const msg = locale === "zh"
            ? "其他设备已更新了简历数据。是否下载最新版本？(确定=下载最新, 取消=覆盖服务器)"
            : "Another device updated the resume. Download latest? (OK=download, Cancel=overwrite server)"
          if (confirm(msg)) {
            const p = res.serverProfile
            const d = migrateData(typeof p.resume_data === "string" ? JSON.parse(p.resume_data) : p.resume_data)
            setData(d); setLayout(p.layout || "classic"); setPaletteId(p.palette || "clean-blue")
            setShowIcons(p.show_icons !== false); setFontScale(p.font_scale || 100)
            localStorage.setItem(LOCAL_KEY, JSON.stringify(d))
            setLastSavedTs(res.serverUpdatedAt || Date.now())
            isDirty.current = false; setSaveIndicator("saved")
          } else {
            // Force overwrite - re-save without lastSavedTs
            fetch("/api/resume-profiles", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profileName: pName, resumeData: latestData, layout, palette: paletteId, showIcons, fontScale, locale, deviceToken: getDeviceToken() }),
            }).then(r => r.json()).then(r => { if (r.success) { setSaveIndicator("saved"); setLastSavedTs(r.updatedAt || Date.now()) } })
          }
        } else if (status === 429) {
          // Rate limited - retry later
          setTimeout(() => triggerServerSave(), SAVE_DEBOUNCE)
          setSaveIndicator("dirty")
        } else { setSaveIndicator("idle") }
      })
      .catch(() => setSaveIndicator("idle"))
  }, [layout, paletteId, showIcons, fontScale, locale, lastSavedTs])

  // ── Manual server save ─────────────────────────────────────────
  const saveToServer = useCallback(() => {
    if (!profileName || profileName.trim().length < 2) { setProfileStatus(l.nameRequired); return }
    setProfileStatus(l.saving)
    localStorage.setItem(PROFILE_KEY, profileName)
    fetch("/api/resume-profiles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileName: profileName.trim(), resumeData: data, layout, palette: paletteId, showIcons, fontScale, locale, deviceToken: getDeviceToken() }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) { setProfileStatus(locale === "zh" ? "保存成功！" : "Saved!"); setLastSavedTs(Date.now()); isDirty.current = false; setSaveIndicator("saved") }
        else if (res.error === "name_taken") setProfileStatus(l.nameTaken)
        else setProfileStatus(res.message || res.error || "Error")
      })
      .catch(() => setProfileStatus("Network error"))
  }, [profileName, data, layout, paletteId, showIcons, fontScale, locale, l])

  // ── Server load ────────────────────────────────────────────────
  const loadFromServer = useCallback((name: string) => {
    if (!name || name.trim().length < 2) { setProfileStatus(l.nameRequired); return }
    setProfileStatus(l.saving)
    fetch(`/api/resume-profiles?name=${encodeURIComponent(name.trim())}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.found) { setProfileStatus(l.profileNotFound); return }
        const p = res.profile
        try {
          const d = migrateData(typeof p.resume_data === "string" ? JSON.parse(p.resume_data) : p.resume_data)
          setData(d); setLayout(p.layout || "classic"); setPaletteId(p.palette || "clean-blue")
          setShowIcons(p.show_icons !== false); setFontScale(p.font_scale || 100); setLocale(p.locale || "en")
          setProfileName(p.profile_name || name)
          localStorage.setItem(LOCAL_KEY, JSON.stringify(d))
          localStorage.setItem(PROFILE_KEY, p.profile_name || name)
          // Link this device token to the profile for multi-device access
          fetch("/api/resume-profiles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileName: p.profile_name, deviceToken: getDeviceToken() }) }).catch(() => {})
          const serverTs = res.updatedAt || Date.now()
          setProfileStatus(l.loadSuccess); setLastSavedTs(serverTs); isDirty.current = false; setSaveIndicator("saved")
        } catch { setProfileStatus("Parse error") }
      })
      .catch(() => setProfileStatus("Network error"))
  }, [l])

  // ── Welcome done ───────────────────────────────────────────────
  const handleWelcomeDone = useCallback((name: string) => {
    setProfileName(name); localStorage.setItem(PROFILE_KEY, name); setShowWelcome(false); setLastSavedTs(Date.now())
  }, [])

  // ── PDF preview ─────────────────────────────────────────────
  const generatePdf = useCallback(() => {
    setActiveSection(null)
    setPdfOpen(true)
  }, [])

  // ── Section click handler ──────────────────────────────────────
  const handleSectionClick = useCallback((section: string) => {
    const map: Record<string, EditSection> = {
      header: "basic", summary: "basic", contact: "basic",
      education: "education", experience: "experience",
      projects: "projects", skills: "skills", custom: "custom",
    }
    setActiveSection(map[section] || "basic")
  }, [])

  // ── Filtered data based on section visibility ──────────────────
  const filteredData = useMemo<ResumeData>(() => {
    return {
      ...data,
      summary: sectionVis.basic ? data.summary : { zh: "", en: "" },
      education: sectionVis.education ? data.education : [],
      experiences: sectionVis.experience ? data.experiences : [],
      projects: sectionVis.projects ? data.projects : [],
      skillGroups: sectionVis.skills ? data.skillGroups : [],
    }
  }, [data, sectionVis])

  // ── Layout mini-previews ───────────────────────────────────────
  const layoutPreviews: Record<LayoutId, React.ReactNode> = {
  classic: <div className="flex w-full flex-col gap-px p-0.5"><div className="h-1/4 rounded-sm bg-muted/40" /><div className="flex-1 rounded-sm bg-muted/30" /></div>,
  modern: <div className="flex w-full flex-col"><div className="h-1/3 bg-primary/20" /><div className="flex-1 bg-muted/30" /></div>,
  sidebar: <><div className="w-1/3 bg-primary/20" /><div className="flex-1 bg-muted/30" /></>,
  compact: <div className="flex w-full flex-col gap-px p-0.5"><div className="h-1/4 rounded-sm bg-muted/40" /><div className="flex flex-1 gap-px"><div className="flex-1 rounded-sm bg-muted/30" /><div className="flex-1 rounded-sm bg-muted/30" /></div></div>,
  timeline: <div className="flex w-full"><div className="mx-auto w-px bg-primary/30" /></div>,
  elegant: <div className="flex w-full flex-col gap-px p-1"><div className="h-1/4 rounded border border-primary/30 bg-muted/20" /><div className="flex-1 rounded border border-border bg-muted/20" /></div>,
  minimal: <div className="flex w-full flex-col gap-1 p-1.5"><div className="h-px bg-muted/40" /><div className="flex-1" /><div className="h-px bg-muted/40" /></div>,
  creative: <><div className="w-2/5 bg-primary/25" /><div className="flex-1 bg-muted/20" /></>,
  // New 12 layouts
  flora: <><div className="w-1/4 bg-pink-200/60" /><div className="flex-1 bg-muted/20 p-0.5"><div className="h-full rounded-sm bg-muted/30" /></div></>,
  "bold-header": <div className="flex w-full flex-col"><div className="h-2/5 bg-primary/30" /><div className="flex flex-1 gap-px"><div className="flex-1 bg-muted/20" /><div className="w-1/3 bg-muted/40" /></div></div>,
  "corner-info": <div className="flex w-full flex-col p-0.5"><div className="mb-px flex"><div className="flex-1" /><div className="h-2 w-1/3 rounded-sm bg-muted/40" /></div><div className="flex flex-1 gap-px"><div className="flex-1 rounded-sm bg-muted/30" /><div className="flex-1 rounded-sm bg-muted/30" /></div></div>,
  "dark-sidebar": <><div className="w-1/3 bg-slate-700" /><div className="flex-1 bg-muted/15" /></>,
  "icon-grid": <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="flex gap-0.5"><div className="h-2 w-2 rounded-full bg-emerald-400/40" /><div className="flex-1 rounded-sm bg-muted/30" /></div><div className="flex gap-0.5"><div className="h-2 w-2 rounded-full bg-emerald-400/40" /><div className="flex-1 rounded-sm bg-muted/30" /></div></div>,
  "formal-table": <div className="flex w-full flex-col p-0.5 gap-px"><div className="h-1/5 rounded-sm bg-primary/20" /><div className="flex-1 rounded-sm border border-muted/40" /></div>,
  bracket: <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="flex items-center gap-0.5"><div className="h-2 w-0.5 bg-primary/50" /><div className="flex-1 rounded-sm bg-muted/30 h-2" /></div><div className="flex flex-1 gap-px"><div className="flex-1 rounded-sm bg-muted/20" /><div className="flex-1 rounded-sm bg-muted/20" /></div></div>,
  "hello-split": <><div className="w-1/4 bg-primary/15 flex items-center justify-center"><div className="h-3/4 w-px bg-primary/40" /></div><div className="flex-1 bg-muted/20 p-0.5"><div className="h-full rounded-sm bg-muted/30" /></div></>,
  "serif-blue": <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="h-1/5 border-b-2 border-blue-400/50" /><div className="flex-1 rounded-sm bg-muted/20" /></div>,
  underline: <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="h-2 border-b border-muted/50" /><div className="flex-1 rounded-sm bg-muted/20" /><div className="h-2 border-b border-muted/50" /><div className="flex-1 rounded-sm bg-muted/20" /></div>,
  "pro-table": <div className="flex w-full flex-col"><div className="h-1/4 bg-slate-800" /><div className="flex-1 bg-muted/20 p-0.5"><div className="h-full rounded-sm border border-muted/30" /></div></div>,
  playful: <div className="flex w-full flex-col p-0.5 gap-0.5"><div className="flex items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-pink-300/60" /><div className="h-2 w-2 rounded-full bg-amber-300/60" /><div className="flex-1 h-2 rounded-full bg-muted/30" /></div><div className="flex-1 rounded-sm bg-muted/20" /></div>,
  nickname: <div className="flex w-full flex-col p-0.5"><div className="h-1/3 flex items-end"><div className="w-1/2 h-2 rounded-sm bg-muted/50" /></div><div className="flex-1 rounded-sm bg-muted/20 mt-0.5" /></div>,
  }

  // Section nav icons
  const sectionIcons: Record<string, string> = {
    basic: "mdi:account-outline", education: "mdi:school-outline", experience: "mdi:briefcase-outline",
    projects: "mdi:folder-outline", skills: "mdi:code-tags", custom: "mdi:puzzle-outline", sections: "mdi:view-grid-outline",
  }
  const sectionNav: { id: EditSection; label: string }[] = [
    { id: "basic", label: l.basic },
    ...(sectionVis.education ? [{ id: "education" as EditSection, label: l.education }] : []),
    ...(sectionVis.experience ? [{ id: "experience" as EditSection, label: l.experience }] : []),
    ...(sectionVis.projects ? [{ id: "projects" as EditSection, label: l.projects }] : []),
    ...(sectionVis.skills ? [{ id: "skills" as EditSection, label: l.skills }] : []),
    ...((data.customSections || []).length > 0 ? [{ id: "custom" as EditSection, label: l.custom }] : []),
    { id: "sections" as EditSection, label: l.sectionMgr },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @media print {
          @page { size: ${paperSize === "a4" ? "A4" : "letter"}; margin: 10mm 8mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print, [data-no-print] { display: none !important; }
          .resume-paper {
            width: 100% !important; max-width: none !important;
            border-radius: 0 !important; box-shadow: none !important;
            margin: 0 !important; padding: 0 !important;
            overflow: visible !important;
          }
          .resume-paper > div { min-height: auto !important; }
          .resume-paper-container {
            padding: 0 !important; margin: 0 !important;
            display: block !important;
          }
          section, article { page-break-inside: avoid; }
          h2, h3, h4 { page-break-after: avoid; }
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      {showWelcome && <WelcomeModal locale={locale} onDone={handleWelcomeDone} onSkip={() => setShowWelcome(false)} onLoadExisting={(name) => { loadFromServer(name); setShowWelcome(false) }} />}

      {/* ── Sticky top bar ─────────────────────────────────────────── */}
      <div className="no-print sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2 sm:px-5">
          <a href="/resume" className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <Icon icon="mdi:arrow-left" className="h-4 w-4" /><span className="hidden font-mono sm:inline">{l.backToResume}</span>
          </a>

          <div className="flex items-center gap-1.5">
            {/* Sync status + last saved */}
            {profileName && (
              <span className={cn("hidden items-center gap-1 text-[10px] sm:flex",
                saveIndicator === "saving" ? "text-amber-500" :
                saveIndicator === "saved" ? "text-emerald-500" :
                saveIndicator === "dirty" ? "text-amber-400" : "text-muted-foreground"
              )}>
                <Icon icon={saveIndicator === "saving" ? "mdi:loading" : saveIndicator === "saved" ? "mdi:cloud-check" : saveIndicator === "dirty" ? "mdi:content-save-edit-outline" : "mdi:cloud-outline"} className={cn("h-3 w-3", saveIndicator === "saving" && "animate-spin")} />
                {saveIndicator === "saving" ? l.saving : saveIndicator === "saved" ? l.saved : saveIndicator === "dirty" ? l.unsaved : profileName}
                {lastSavedTs > 0 && saveIndicator !== "saving" && (
                  <span className="ml-1 text-[9px] text-muted-foreground">({l.lastSaved}: {relativeTime(lastSavedTs, locale)})</span>
                )}
              </span>
            )}

            <button onClick={() => { setProfileStatus(""); setProfileModal(true) }} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors", profileName ? "border-emerald-500/30 text-emerald-600 hover:border-emerald-500" : "border-amber-500/30 text-amber-500 hover:border-amber-500")}>
              <Icon icon={profileName ? "mdi:cloud-check-outline" : "mdi:cloud-off-outline"} className="h-3.5 w-3.5" />
              <span className="hidden font-mono sm:inline">{profileName ? l.syncStatus : l.notSynced}</span>
            </button>

            <button onClick={() => setShowSettings(!showSettings)} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-mono transition-colors", showSettings ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary")}>
              <Icon icon="mdi:tune-variant" className="h-3.5 w-3.5" /><span className="hidden sm:inline">{showSettings ? l.hideSettings : l.settings}</span>
            </button>

            <button onClick={() => setLocale((v) => v === "zh" ? "en" : "zh")} className="rounded-full border border-border px-2.5 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:border-primary hover:text-primary">{locale === "zh" ? "EN" : "中文"}</button>

            <button onClick={generatePdf} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:opacity-90">
              <Icon icon="mdi:file-pdf-box" className="h-3.5 w-3.5" /><span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* ── Settings panel ──────────────────────────── */}
        {showSettings && (
          <div className="border-t border-border px-3 py-4 sm:px-5">
            <div className="mx-auto max-w-[860px] space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{l.layout} ({LAYOUTS.length})</p>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-10">
                  {LAYOUTS.map((lo) => (
                    <button key={lo.id} onClick={() => setLayout(lo.id)} className={cn("rounded-lg border p-1.5 text-center transition-all", layout === lo.id ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:border-muted-foreground/40")} title={lo.description[locale]}>
                      <div className="mb-1 flex h-6 gap-0.5 overflow-hidden rounded border border-border/50">{layoutPreviews[lo.id]}</div>
                      <p className="text-[8px] font-bold text-foreground leading-tight truncate">{lo.label[locale]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-5">
                <div>
                  <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{l.palette}</p>
                  <div className="flex flex-wrap gap-2">
                    {PALETTES.map((p) => (
                      <button key={p.id} onClick={() => setPaletteId(p.id)} className={cn("group flex flex-col items-center gap-0.5 transition-transform", paletteId === p.id && "scale-110")} title={p.label}>
                        <div className={cn("h-5 w-5 rounded-full border-2 transition-all", paletteId === p.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/40")} style={{ background: p.swatch }} />
                        <span className="text-[7px] text-muted-foreground">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper size */}
                <div>
                  <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{l.paper}</p>
                  <div className="flex gap-1">
                    {(Object.keys(PAPER_SIZES) as PaperSize[]).filter((k) => k !== "custom").map((k) => (
                      <button key={k} onClick={() => setPaperSize(k)} className={cn("rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors", paperSize === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{PAPER_SIZES[k].label}</button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setShowIcons(!showIcons)} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors", showIcons ? "border-primary text-primary" : "border-border text-muted-foreground")}>
                  <Icon icon={showIcons ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="h-3.5 w-3.5" />{l.icons}: {showIcons ? "ON" : "OFF"}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">{l.fontSize}</span>
                  <button onClick={() => setFontScale((v) => Math.max(70, v - 5))} className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground">-</button>
                  <span className="w-8 text-center text-xs font-mono text-foreground">{fontScale}%</span>
                  <button onClick={() => setFontScale((v) => Math.min(150, v + 5))} className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground">+</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-border pt-3">
                <button onClick={() => { const json = JSON.stringify(data, null, 2); const blob = new Blob([json], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "resume-data.json"; a.click(); URL.revokeObjectURL(url) }} className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"><Icon icon="mdi:download" className="h-3.5 w-3.5" />{l.exportJson}</button>
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                  <Icon icon="mdi:upload" className="h-3.5 w-3.5" />{l.importJson}
                  <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = (ev) => { try { const d = migrateData(JSON.parse(ev.target?.result as string)); setData(d); localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); isDirty.current = true; setSaveIndicator("dirty") } catch {} }; reader.readAsText(f) }} />
                </label>
                <button onClick={() => { if (confirm(l.resetConfirm)) { const d = getDefaultData(); setData(d); localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); isDirty.current = true; setSaveIndicator("dirty") } }} className="flex items-center gap-1.5 text-[11px] text-destructive hover:underline"><Icon icon="mdi:refresh" className="h-3.5 w-3.5" />{l.reset}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Section nav strip (inside sticky) ──────────────────── */}
        <div className="flex justify-center gap-1 overflow-x-auto border-t border-border bg-card/80 px-3 py-1.5 backdrop-blur-sm">
          {sectionNav.map((sec) => (
            <button key={sec.id} onClick={() => setActiveSection(activeSection === sec.id ? null : sec.id)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeSection === sec.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
                sec.id === "sections" && "ml-2 border-dashed")}>
              <Icon icon={sectionIcons[sec.id!] || "mdi:circle"} className="h-3.5 w-3.5" /><span className="hidden sm:inline">{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Edit hint ──────────────────────────────────────────────── */}
      {!activeSection && (
        <div className="no-print flex justify-center py-2">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary"><Icon icon="mdi:cursor-default-click-outline" className="h-3.5 w-3.5" />{l.editHint}</span>
        </div>
      )}

      {/* ── Resume Paper ───────────────────────────────────────────── */}
      <div className={cn("resume-paper-container flex justify-center px-4 py-6 transition-all sm:px-6", activeSection ? "sm:pr-[420px]" : "")}>
        <div ref={resumeRef} className="resume-paper overflow-hidden rounded-lg shadow-2xl" style={{ width: paper.w, minHeight: paper.h, maxWidth: "100%", background: palette.bg }}>
          <div style={{ minHeight: paper.h, display: 'flex', flexDirection: 'column' }}>
            <ResumeRenderer data={filteredData} palette={palette} layout={layout} locale={locale} showIcons={showIcons} fontScale={fontScale} activeSection={activeSection} onSectionClick={handleSectionClick} />
          </div>
        </div>
      </div>

      {/* ── Overlay backdrop for mobile ────────────────────────────── */}
      {activeSection && <div className="no-print fixed inset-0 z-40 bg-black/30 sm:hidden" onClick={() => setActiveSection(null)} />}

      {/* ── Section Editor Panel ───────────────────────────────────── */}
      <div className="no-print">
        <SectionEditor section={activeSection} data={data} update={update} locale={locale} onClose={() => setActiveSection(null)} sectionVis={sectionVis} setSectionVis={setSectionVis} />
      </div>

      <div className="no-print">
        <ProfileModal open={profileModal} onClose={() => setProfileModal(false)} locale={locale} profileName={profileName} setProfileName={setProfileName} onSaveServer={saveToServer} onLoadServer={loadFromServer} status={profileStatus} />
      </div>

      <PdfPreviewModal open={pdfOpen} onClose={() => setPdfOpen(false)} locale={locale} data={filteredData} palette={palette} layout={layout} showIcons={showIcons} fontScale={fontScale} paper={paper} paperSize={paperSize} resumeName={profileName || data.name[locale] || "resume"} />
    </div>
  )
}
