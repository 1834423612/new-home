"use client"

import { useState, useMemo } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useSiteData } from "@/hooks/use-site-data"
import { PALETTES, type LayoutId, type PaletteId, type ResumeData } from "@/lib/resume-templates"
import { ResumeRenderer } from "@/components/resume/resume-renderer"
import { ResumeToolbar } from "@/components/resume/resume-toolbar"

export default function ResumePage() {
  const { locale, toggleLocale, dict } = useLocale()
  const { experiences, skills, projects } = useSiteData()

  const [layout, setLayout] = useState<LayoutId>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("kjch-resume-layout") as LayoutId) || "classic"
    return "classic"
  })
  const [paletteId, setPaletteId] = useState<PaletteId>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("kjch-resume-palette") as PaletteId) || "dark-gold"
    return "dark-gold"
  })
  const [showIcons, setShowIcons] = useState<boolean>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("kjch-resume-icons") !== "false"
    return true
  })

  const palette = PALETTES.find((p) => p.id === paletteId) || PALETTES[0]

  const handleLayout = (l: LayoutId) => { setLayout(l); localStorage.setItem("kjch-resume-layout", l) }
  const handlePalette = (p: PaletteId) => { setPaletteId(p); localStorage.setItem("kjch-resume-palette", p) }
  const handleToggleIcons = () => { setShowIcons((v) => { const next = !v; localStorage.setItem("kjch-resume-icons", String(next)); return next }) }

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4)
  const mainCategories = ["frontend", "backend", "devops", "design"]

  const resumeData: ResumeData = useMemo(() => ({
    name: { zh: "况佳城", en: "Kuang Jiacheng" },
    tagline: { zh: "全栈开发者 / 设计爱好者", en: "Full-Stack Developer / Design Enthusiast" },
    email: "admin@kjchmc.cn",
    website: "www.kjchmc.cn",
    github: "github.com/1834423612",
    location: "Ohio, USA",
    summary: {
      zh: "热爱互联网技术，具备前端开发(React/Next.js/Vue)、后端开发(Node.js/PHP/Python)及UI设计能力。在FRC机器人团队中负责Scouting系统全栈开发，有丰富的团队协作经验。",
      en: "Passionate about internet technology with expertise in frontend (React/Next.js/Vue), backend (Node.js/PHP/Python), and UI design. Full-stack developer on FRC robotics Scouting system with rich team collaboration experience.",
    },
    education: [
      { school: "Beachwood High School", detail: { zh: "俄亥俄州", en: "Ohio, USA" }, period: "2023 - " + (locale === "zh" ? "至今" : "Present") },
      { school: locale === "zh" ? "北京市忠德学校" : "Beijing Zhongde School", detail: { zh: "初中", en: "Middle School" }, period: "2019 - 2022" },
    ],
    experiences: experiences.map((e) => ({
      title: e.title, org: e.org, description: e.description,
      startDate: e.startDate, endDate: e.endDate, icon: e.icon,
    })),
    projects: featuredProjects.map((p) => ({
      title: p.title, description: p.description, date: p.date, tags: p.tags, link: p.link,
    })),
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
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 10mm; }
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
        onPrint={() => window.print()} backHref="/"
      />

      {/* DIY Link */}
      <div className="no-print flex justify-center py-2">
        <a href="/resume/diy" className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <Icon icon="mdi:pencil-ruler" className="h-3.5 w-3.5" />
          {locale === "zh" ? "DIY - 自己制作简历" : "DIY - Build Your Own Resume"}
        </a>
      </div>

      {/* Resume Paper */}
      <div className="flex justify-center px-4 py-8 sm:px-6 print:p-0">
        <div className="resume-paper w-full max-w-[800px] overflow-hidden rounded-lg shadow-2xl print:shadow-none">
          <ResumeRenderer data={resumeData} palette={palette} layout={layout} locale={locale} showIcons={showIcons} />
        </div>
      </div>
    </div>
  )
}
