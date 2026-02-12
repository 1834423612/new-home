"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { PALETTES, type LayoutId, type PaletteId, type PaletteOption, type ResumeData } from "@/lib/resume-templates"
import { ResumeRenderer } from "@/components/resume/resume-renderer"
import { ResumeToolbar } from "@/components/resume/resume-toolbar"
import { cn } from "@/lib/utils"

export default function ResumePage() {
  const { locale, toggleLocale, dict } = useLocale()
  const { experiences, skills, projects } = useSiteData()

  const [layout, setLayout] = useState<LayoutId>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("kjch-resume-layout") as LayoutId) || "creative"
    return "creative"
  })
  const [paletteId, setPaletteId] = useState<PaletteId>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("kjch-resume-palette") as PaletteId) || "clean-blue"
    return "clean-blue"
  })
  const [showIcons, setShowIcons] = useState<boolean>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("kjch-resume-icons") !== "false"
    return true
  })

  const palette = PALETTES.find((p) => p.id === paletteId) || PALETTES[0]
  const [pdfOpen, setPdfOpen] = useState(false)

  const handleLayout = (l: LayoutId) => { setLayout(l); localStorage.setItem("kjch-resume-layout", l) }
  const handlePalette = (p: PaletteId) => { setPaletteId(p); localStorage.setItem("kjch-resume-palette", p) }
  const handleToggleIcons = () => { setShowIcons((v) => { const next = !v; localStorage.setItem("kjch-resume-icons", String(next)); return next }) }

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4)
  const mainCategories = ["frontend", "backend", "devops", "design"]

  const resumeData: ResumeData = useMemo(() => ({
    name: { zh: "况佳城 (kjch)", en: "Jiacheng Kuang (Kevin)" },
    tagline: { zh: "全栈开发者 / 设计爱好者", en: "Full-Stack Developer / Design Enthusiast" },
    email: "",
    emails: [{ label: "Personal", address: "admin@kjchmc.cn" }],
    phone: "",
    website: "www.kjch.net",
    github: "github.com/1834423612",
    linkedin: "",
    location: "Ohio, USA",
    avatar: "https://r2.fastbirdcdn.online/kjch-site/avatars/1770917734977-hdImg_e82ea227498f88935cbc74e33dc40a861530868435913.jpg",
    socialLinks: [
      { "url": "@kjch0720", "icon": "mdi:instagram", "platform": "Instagram" }, 
      { "url": "kjch666FFF", "icon": "mdi:wechat", "platform": "WeChat" }
    ],
    summary: {
      zh: "热爱互联网技术，自2019年起开始自学编程，目前具备前端开发(React/Next.js/Vue)、后端开发(Node.js/PHP/Python)及UI设计能力。在 FRC Team 695 Bison 机器人团队中作为项目核心开发者带领并负责 Scouting 系统、团队网站、Pit-Scouting、Team API 等全栈开发，有丰富的团队协作经验。",
      en: "Passionate about internet technology, self-taught programming since 2019. Currently capable in front-end development (React/Next.js/Vue), back-end development (Node.js/PHP/Python), and UI design. Served as full-stack core & lead developer for the FRC Team 695 Bison Robotics, responsible for the Scouting system, team website, Pit-Scouting, and Team API, with extensive team collaboration experience.",
    },
    education: [
      { school: "Beachwood High School", degree: { zh: "高中", en: "High School" }, detail: { zh: "俄亥俄州", en: "Ohio, USA" }, period: "2022 - " + (locale === "zh" ? "至今" : "Present") },
      { school: locale === "zh" ? "北京市忠德学校" : "Beijing Zhongde School", degree: { zh: "初中", en: "Middle School" }, detail: { zh: "初中", en: "Middle School" }, period: "2019 - 2022" },
    ],
    experiences: experiences.map((e) => ({
      title: e.title, org: e.org, description: e.description,
      startDate: e.startDate, endDate: e.endDate, icon: e.icon,
    })),
    projects: featuredProjects.map((p) => ({
      title: p.title, description: p.description, date: p.date, tags: p.tags, link: p.link,
    })),
    customSections: [],
    skillGroups: mainCategories.map((cat) => ({
      label: {
        zh: dict.skills.categories[cat as keyof typeof dict.skills.categories] || cat,
        en: dict.skills.categories[cat as keyof typeof dict.skills.categories] || cat,
      },
      items: skills.filter((s) => s.category === cat).map((s) => ({ name: s.name, icon: s.icon })),
    })),
  }), [experiences, projects, skills, dict, locale, featuredProjects, mainCategories])

  return (
    <div className="min-h-screen bg-background">
      {/* // @page { size: A4; margin: 12mm 10mm; } */}
      <style>{`
        @media print {
          @page { size: letter; margin: 0.5in 0.4in; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .resume-paper { max-width: none !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; }
          section, div { page-break-inside: avoid; }
        }
      `}</style>

      <ResumeToolbar
        layout={layout} palette={paletteId} showIcons={showIcons} locale={locale}
        onLayoutChange={handleLayout} onPaletteChange={handlePalette}
        onToggleIcons={handleToggleIcons} onToggleLocale={toggleLocale}
        onPrint={() => setPdfOpen(true)} backHref="/"
      />

      {/* DIY Link */}
      <div className="no-print flex justify-center py-2">
        <a href="/resume/diy" className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Icon icon="mdi:pencil-ruler" className="h-3.5 w-3.5" />
          {locale === "zh" ? "DIY - 自己制作简历" : "DIY - Build Your Own Resume"}
        </a>
      </div>

      {/* Resume Paper — US Letter 816×1056 */}
      <div className="flex justify-center px-4 py-8 sm:px-6 print:p-0">
        <div className="resume-paper overflow-hidden rounded-lg shadow-2xl print:shadow-none" style={{ width: 816, minHeight: 1056, maxWidth: '100%', background: palette.bg }}>
          <div style={{ minHeight: 1056, display: 'flex', flexDirection: 'column' }}>
            <ResumeRenderer data={resumeData} palette={palette} layout={layout} locale={locale} showIcons={showIcons} />
          </div>
        </div>
      </div>
      <PdfPreviewModal open={pdfOpen} onClose={() => setPdfOpen(false)} locale={locale} data={resumeData} palette={palette} layout={layout} showIcons={showIcons} />
    </div>
  )
}

// ── PDF Preview helpers ───────────────────────────────────────────────

const PAPER_W = 816
const PAPER_H = 1056

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
    for (const r of Array.from(rects)) {
      if (r.width < 1 || r.height < 1) continue
      result.push({
        text,
        x: r.left - cRect.left,
        y: r.top - cRect.top,
        fontSize,
        width: r.width || parent.getBoundingClientRect().width,
      })
      break
    }
  }
  return result
}

function PdfPreviewModal({ open, onClose, locale, data, palette, layout, showIcons }: {
  open: boolean; onClose: () => void; locale: "zh" | "en"
  data: ResumeData; palette: PaletteOption; layout: LayoutId; showIcons: boolean
}) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!previewRef.current || downloading) return
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")
      const el = previewRef.current
      const textItems = extractTextPositions(el)
      const elW = el.offsetWidth
      const elH = el.offsetHeight

      const prevRadius = el.style.borderRadius
      el.style.borderRadius = "0"
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: palette.bg })
      el.style.borderRadius = prevRadius

      const imgData = canvas.toDataURL("image/png")
      const pdfW = 215.9 // US Letter mm
      const pdfH = 279.4
      const imgH = (canvas.height * pdfW) / canvas.width
      const finalH = Math.max(pdfH, imgH)
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfW, finalH] })
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH)

      const sx = pdfW / elW
      const sy = imgH / elH
      const PT_PER_MM = 72 / 25.4
      textItems.forEach(({ text, x, y, fontSize, width }) => {
        const pdfFontSize = Math.max(1, Math.min(72, fontSize * sx * PT_PER_MM))
        const pdfX = x * sx
        const pdfY = y * sy + fontSize * sy * 0.78
        const pdfMaxW = width * sx
        pdf.setFontSize(pdfFontSize)
        ;(pdf.internal as unknown as { write: (s: string) => void }).write("3 Tr")
        pdf.text(text, pdfX, pdfY, { maxWidth: pdfMaxW > 0 ? pdfMaxW : undefined })
        ;(pdf.internal as unknown as { write: (s: string) => void }).write("0 Tr")
      })

      pdf.save(`resume-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) { console.error("PDF download failed", err) }
    setDownloading(false)
  }, [downloading, palette.bg])

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
        @page { size: letter; margin: 10mm 8mm; }
        html, body { margin: 0 !important; padding: 0 !important; }
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .resume-print-root { width: ${PAPER_W}px; min-height: ${PAPER_H}px; background: ${palette.bg}; overflow: visible; display: flex; flex-direction: column; }
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
  }, [palette.bg])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-sm font-bold text-white">{locale === "zh" ? "PDF 预览" : "PDF Preview"}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
            <Icon icon={downloading ? "mdi:loading" : "mdi:download"} className={cn("h-3.5 w-3.5", downloading && "animate-spin")} />
            {downloading ? (locale === "zh" ? "生成中..." : "Generating...") : (locale === "zh" ? "下载 PDF" : "Download PDF")}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20">
            <Icon icon="mdi:printer-outline" className="h-3.5 w-3.5" />{locale === "zh" ? "打印" : "Print"}
          </button>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20">
            {locale === "zh" ? "关闭预览" : "Close"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto" style={{ width: PAPER_W, maxWidth: "100%" }}>
          <div ref={previewRef} className="mx-auto overflow-hidden rounded-lg shadow-2xl" style={{ width: PAPER_W, minHeight: PAPER_H, maxWidth: "100%", background: palette.bg }}>
            <div style={{ minHeight: PAPER_H, display: "flex", flexDirection: "column" }}>
              <ResumeRenderer data={data} palette={palette} layout={layout} locale={locale} showIcons={showIcons} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}