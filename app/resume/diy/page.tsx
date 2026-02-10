"use client"

import { useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { PALETTES, LAYOUTS, type LayoutId, type PaletteId, type ResumeData } from "@/lib/resume-templates"
import { ResumeRenderer } from "@/components/resume/resume-renderer"
import { ResumeToolbar } from "@/components/resume/resume-toolbar"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "kjch-diy-resume"

function getDefaultData(): ResumeData {
  return {
    name: { zh: "你的名字", en: "Your Name" },
    tagline: { zh: "你的职位 / 标签", en: "Your Title / Tagline" },
    email: "email@example.com",
    website: "www.example.com",
    github: "github.com/username",
    location: "City, Country",
    summary: {
      zh: "在这里写一段关于你自己的简短介绍...",
      en: "Write a brief summary about yourself here...",
    },
    education: [
      { school: "Your University", detail: { zh: "计算机科学", en: "Computer Science" }, period: "2020 - 2024" },
    ],
    experiences: [
      { title: { zh: "软件工程师", en: "Software Engineer" }, org: { zh: "某公司", en: "Some Company" }, description: { zh: "描述你的工作内容...", en: "Describe your work here..." }, startDate: "2024", icon: "mdi:briefcase-outline" },
    ],
    projects: [
      { title: { zh: "项目名称", en: "Project Name" }, description: { zh: "项目描述...", en: "Project description..." }, date: "2024", tags: ["React", "TypeScript"] },
    ],
    skillGroups: [
      { label: { zh: "前端", en: "Frontend" }, items: [{ name: "React" }, { name: "TypeScript" }, { name: "Tailwind CSS" }] },
      { label: { zh: "后端", en: "Backend" }, items: [{ name: "Node.js" }, { name: "Python" }] },
    ],
  }
}

function loadSaved(): ResumeData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

type EditTab = "basic" | "education" | "experience" | "projects" | "skills"

export default function DIYResumePage() {
  const [locale, setLocale] = useState<"zh" | "en">("en")
  const [layout, setLayout] = useState<LayoutId>("classic")
  const [paletteId, setPaletteId] = useState<PaletteId>("clean-blue")
  const [showIcons, setShowIcons] = useState(true)
  const [data, setData] = useState<ResumeData>(() => loadSaved() || getDefaultData())
  const [editTab, setEditTab] = useState<EditTab>("basic")
  const [showEditor, setShowEditor] = useState(true)

  const palette = PALETTES.find((p) => p.id === paletteId) || PALETTES[1]

  const save = useCallback((d: ResumeData) => {
    setData(d)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  }, [])

  const update = useCallback((fn: (prev: ResumeData) => ResumeData) => {
    setData((prev) => { const next = fn(prev); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next })
  }, [])

  const editTabs: { id: EditTab; label: { zh: string; en: string }; icon: string }[] = [
    { id: "basic", label: { zh: "基本信息", en: "Basic Info" }, icon: "mdi:account-outline" },
    { id: "education", label: { zh: "教育经历", en: "Education" }, icon: "mdi:school-outline" },
    { id: "experience", label: { zh: "工作经验", en: "Experience" }, icon: "mdi:briefcase-outline" },
    { id: "projects", label: { zh: "项目", en: "Projects" }, icon: "mdi:folder-outline" },
    { id: "skills", label: { zh: "技能", en: "Skills" }, icon: "mdi:code-tags" },
  ]

  // Helper for bilingual input
  const BiInput = ({ label, value, onChange }: { label: string; value: { zh: string; en: string }; onChange: (v: { zh: string; en: string }) => void }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase text-muted-foreground">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border border-border bg-background px-2 py-1.5 text-xs" placeholder="Chinese" value={value.zh} onChange={(e) => onChange({ ...value, zh: e.target.value })} />
        <input className="rounded border border-border bg-background px-2 py-1.5 text-xs" placeholder="English" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </div>
    </div>
  )

  const Input = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase text-muted-foreground">{label}</label>
      <input className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )

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
        onLayoutChange={setLayout} onPaletteChange={setPaletteId}
        onToggleIcons={() => setShowIcons((v) => !v)} onToggleLocale={() => setLocale((v) => v === "zh" ? "en" : "zh")}
        onPrint={() => window.print()} backHref="/resume"
      />

      {/* Editor toggle */}
      <div className="no-print flex justify-center py-2 border-b border-border bg-card/50">
        <button onClick={() => setShowEditor(!showEditor)} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
          <Icon icon={showEditor ? "mdi:chevron-up" : "mdi:chevron-down"} className="h-4 w-4" />
          {locale === "zh" ? (showEditor ? "收起编辑器" : "展开编辑器") : (showEditor ? "Hide Editor" : "Show Editor")}
        </button>
      </div>

      {/* Editor Panel */}
      {showEditor && (
        <div className="no-print border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="mx-auto max-w-[800px] px-4 py-4 sm:px-6">
            {/* Tab bar */}
            <div className="mb-4 flex gap-1 overflow-x-auto">
              {editTabs.map((t) => (
                <button key={t.id} onClick={() => setEditTab(t.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors", editTab === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                  <Icon icon={t.icon} className="h-3.5 w-3.5" />
                  {t.label[locale]}
                </button>
              ))}
            </div>

            {/* Basic info */}
            {editTab === "basic" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <BiInput label="Name" value={data.name} onChange={(v) => update((d) => ({ ...d, name: v }))} />
                <BiInput label="Tagline" value={data.tagline} onChange={(v) => update((d) => ({ ...d, tagline: v }))} />
                <Input label="Email" value={data.email} onChange={(v) => update((d) => ({ ...d, email: v }))} />
                <Input label="Website" value={data.website} onChange={(v) => update((d) => ({ ...d, website: v }))} />
                <Input label="GitHub" value={data.github} onChange={(v) => update((d) => ({ ...d, github: v }))} />
                <Input label="Location" value={data.location} onChange={(v) => update((d) => ({ ...d, location: v }))} />
                <div className="sm:col-span-2"><BiInput label="Summary" value={data.summary} onChange={(v) => update((d) => ({ ...d, summary: v }))} /></div>
              </div>
            )}

            {/* Education */}
            {editTab === "education" && (
              <div className="space-y-3">
                {data.education.map((edu, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                      <button onClick={() => update((d) => ({ ...d, education: d.education.filter((_, j) => j !== i) }))} className="text-destructive text-xs"><Icon icon="mdi:close" className="h-3.5 w-3.5" /></button>
                    </div>
                    <Input label="School" value={edu.school} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, school: v } : e) }))} />
                    <BiInput label="Detail" value={edu.detail} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, detail: v } : e) }))} />
                    <Input label="Period" value={edu.period} onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, period: v } : e) }))} />
                  </div>
                ))}
                <button onClick={() => update((d) => ({ ...d, education: [...d.education, { school: "", detail: { zh: "", en: "" }, period: "" }] }))} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Icon icon="mdi:plus" className="h-3.5 w-3.5" />{locale === "zh" ? "添加" : "Add"}</button>
              </div>
            )}

            {/* Experience */}
            {editTab === "experience" && (
              <div className="space-y-3">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                      <button onClick={() => update((d) => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))} className="text-destructive text-xs"><Icon icon="mdi:close" className="h-3.5 w-3.5" /></button>
                    </div>
                    <BiInput label="Title" value={exp.title} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, title: v } : e) }))} />
                    <BiInput label="Organization" value={exp.org} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, org: v } : e) }))} />
                    <BiInput label="Description" value={exp.description} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, description: v } : e) }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Start" value={exp.startDate} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, startDate: v } : e) }))} />
                      <Input label="End" value={exp.endDate || ""} onChange={(v) => update((d) => ({ ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, endDate: v || undefined } : e) }))} placeholder="Present" />
                    </div>
                  </div>
                ))}
                <button onClick={() => update((d) => ({ ...d, experiences: [...d.experiences, { title: { zh: "", en: "" }, org: { zh: "", en: "" }, description: { zh: "", en: "" }, startDate: "" }] }))} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Icon icon="mdi:plus" className="h-3.5 w-3.5" />{locale === "zh" ? "添加" : "Add"}</button>
              </div>
            )}

            {/* Projects */}
            {editTab === "projects" && (
              <div className="space-y-3">
                {data.projects.map((proj, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                      <button onClick={() => update((d) => ({ ...d, projects: d.projects.filter((_, j) => j !== i) }))} className="text-destructive text-xs"><Icon icon="mdi:close" className="h-3.5 w-3.5" /></button>
                    </div>
                    <BiInput label="Title" value={proj.title} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, title: v } : p) }))} />
                    <BiInput label="Description" value={proj.description} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, description: v } : p) }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Date" value={proj.date} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, date: v } : p) }))} />
                      <Input label="Tags (comma)" value={proj.tags.join(", ")} onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, tags: v.split(",").map((t) => t.trim()).filter(Boolean) } : p) }))} />
                    </div>
                  </div>
                ))}
                <button onClick={() => update((d) => ({ ...d, projects: [...d.projects, { title: { zh: "", en: "" }, description: { zh: "", en: "" }, date: "", tags: [] }] }))} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Icon icon="mdi:plus" className="h-3.5 w-3.5" />{locale === "zh" ? "添加" : "Add"}</button>
              </div>
            )}

            {/* Skills */}
            {editTab === "skills" && (
              <div className="space-y-3">
                {data.skillGroups.map((group, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                      <button onClick={() => update((d) => ({ ...d, skillGroups: d.skillGroups.filter((_, j) => j !== i) }))} className="text-destructive text-xs"><Icon icon="mdi:close" className="h-3.5 w-3.5" /></button>
                    </div>
                    <BiInput label="Group Label" value={group.label} onChange={(v) => update((d) => ({ ...d, skillGroups: d.skillGroups.map((g, j) => j === i ? { ...g, label: v } : g) }))} />
                    <Input label="Skills (comma)" value={group.items.map((s) => s.name).join(", ")} onChange={(v) => update((d) => ({ ...d, skillGroups: d.skillGroups.map((g, j) => j === i ? { ...g, items: v.split(",").map((s) => ({ name: s.trim() })).filter((s) => s.name) } : g) }))} />
                  </div>
                ))}
                <button onClick={() => update((d) => ({ ...d, skillGroups: [...d.skillGroups, { label: { zh: "", en: "" }, items: [] }] }))} className="flex items-center gap-1.5 text-xs text-primary hover:underline"><Icon icon="mdi:plus" className="h-3.5 w-3.5" />{locale === "zh" ? "添加" : "Add"}</button>
              </div>
            )}

            {/* Actions row */}
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => { const json = JSON.stringify(data, null, 2); const blob = new Blob([json], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "resume-data.json"; a.click(); URL.revokeObjectURL(url) }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><Icon icon="mdi:download" className="h-3.5 w-3.5" />{locale === "zh" ? "导出 JSON" : "Export JSON"}</button>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Icon icon="mdi:upload" className="h-3.5 w-3.5" />{locale === "zh" ? "导入 JSON" : "Import JSON"}
                <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = (ev) => { try { const d = JSON.parse(ev.target?.result as string); save(d) } catch {} }; reader.readAsText(f) }} />
              </label>
              <button onClick={() => { if (confirm(locale === "zh" ? "确定要重置所有数据吗？" : "Reset all data?")) save(getDefaultData()) }} className="flex items-center gap-1.5 text-xs text-destructive hover:underline"><Icon icon="mdi:refresh" className="h-3.5 w-3.5" />{locale === "zh" ? "重置" : "Reset"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Paper */}
      <div className="flex justify-center px-4 py-8 sm:px-6 print:p-0">
        <div className="resume-paper w-full max-w-[800px] overflow-hidden rounded-lg shadow-2xl print:shadow-none">
          <ResumeRenderer data={data} palette={palette} layout={layout} locale={locale} showIcons={showIcons} />
        </div>
      </div>
    </div>
  )
}
