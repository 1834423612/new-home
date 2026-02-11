"use client"

import React from "react"

import { Icon } from "@iconify/react"
import type { ResumeData, PaletteOption, LayoutId } from "@/lib/resume-templates"

interface Props {
  data: ResumeData
  palette: PaletteOption
  layout: LayoutId
  locale: "zh" | "en"
  showIcons: boolean
}

// Localized labels for resume sections
const labels = {
  zh: {
    personalSummary: "个人简介",
    education: "教育经历",
    experience: "工作经验",
    projects: "项目经历",
    skills: "技能",
    present: "至今",
    timelineTitle: "经历时间线",
    now: "现在",
  },
  en: {
    personalSummary: "Summary",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    present: "Present",
    timelineTitle: "Experience Timeline",
    now: "Now",
  },
}

function SectionTitle({ children, palette, icon, showIcons }: { children: React.ReactNode; palette: PaletteOption; icon?: string; showIcons: boolean }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: palette.accent }}>
      {showIcons && icon && <Icon icon={icon} className="h-3.5 w-3.5" />}
      {children}
    </h2>
  )
}

function SkillTag({ name, icon, palette, showIcons }: { name: string; icon?: string; palette: PaletteOption; showIcons: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: palette.border, color: palette.muted }}>
      {showIcons && icon && <Icon icon={icon} className="h-3 w-3" />}
      {name}
    </span>
  )
}

// ===== CLASSIC LAYOUT =====
function ClassicLayout({ data, palette, locale, showIcons }: Omit<Props, "layout">) {
  const l = locale
  return (
    <div className="p-8 sm:p-10" style={{ background: palette.bg, color: palette.text }}>
      {/* Header */}
      <header className="mb-6 border-b pb-5" style={{ borderColor: palette.border }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.name[l]}</h1>
            <p className="mt-0.5 text-sm" style={{ color: palette.accent }}>{data.tagline[l]}</p>
          </div>
          <div className="flex flex-col gap-1 text-[11px]" style={{ color: palette.muted }}>
            {showIcons ? (
              <>
                <span className="flex items-center gap-1.5"><Icon icon="mdi:map-marker-outline" className="h-3 w-3" />{data.location}</span>
                <span className="flex items-center gap-1.5"><Icon icon="mdi:email-outline" className="h-3 w-3" />{data.email}</span>
                <span className="flex items-center gap-1.5"><Icon icon="mdi:web" className="h-3 w-3" />{data.website}</span>
                <span className="flex items-center gap-1.5"><Icon icon="mdi:github" className="h-3 w-3" />{data.github}</span>
              </>
            ) : (
              <>
                <span>{data.location}</span>
                <span>{data.email}</span>
                <span>{data.website}</span>
                <span>{data.github}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-5">
        <SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>
          {labels[l].personalSummary}
        </SectionTitle>
        <p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p>
      </section>

      {/* Education */}
      <section className="mb-5">
        <SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>
          {labels[l].education}
        </SectionTitle>
        <div className="flex flex-col gap-2">
          {data.education.map((e, i) => (
            <div key={i} className="flex items-start justify-between">
              <div><p className="text-xs font-bold">{e.school}</p><p className="text-[11px]" style={{ color: palette.muted }}>{e.detail[l]}</p></div>
              <span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{e.period}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-5" style={{ pageBreakInside: "avoid" }}>
        <SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>
          {labels[l].experience}
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ pageBreakInside: "avoid" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold">{exp.title[l]}</p>
                  <p className="text-[11px]" style={{ color: palette.accent, opacity: 0.8 }}>{exp.org[l]}</p>
                </div>
                <span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-5" style={{ pageBreakInside: "avoid" }}>
        <SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>
          {labels[l].projects}
        </SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {data.projects.map((p, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}>
              <p className="text-xs font-bold">{p.title[l]}</p>
              <p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((t) => <span key={t} className="rounded-full border px-1.5 py-px text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section style={{ pageBreakInside: "avoid" }}>
        <SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>
          {labels[l].skills}
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.skillGroups.map((g, i) => (
            <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ===== MODERN LAYOUT (colored banner header) =====
function ModernLayout({ data, palette, locale, showIcons }: Omit<Props, "layout">) {
  const l = locale
  return (
    <div style={{ background: palette.bg, color: palette.text }}>
      {/* Banner Header */}
      <header className="px-8 py-8 sm:px-10" style={{ background: palette.headingBg, color: palette.headingText }}>
        <h1 className="text-3xl font-bold">{data.name[l]}</h1>
        <p className="mt-1 text-sm opacity-90">{data.tagline[l]}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] opacity-80">
          <span>{data.location}</span>
          <span>{data.email}</span>
          <span>{data.website}</span>
          <span>{data.github}</span>
        </div>
      </header>

      <div className="p-8 sm:p-10">
        <section className="mb-5"><SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle><p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p></section>

        <div className="mb-5 grid gap-5 sm:grid-cols-2">
          <section><SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>{labels[l].education}</SectionTitle><div className="flex flex-col gap-2">{data.education.map((e, i) => <div key={i}><p className="text-xs font-bold">{e.school}</p><p className="text-[11px]" style={{ color: palette.muted }}>{e.detail[l]} &middot; {e.period}</p></div>)}</div></section>
          <section style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle><div className="flex flex-col gap-2">{data.skillGroups.map((g, i) => <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}</div></section>
        </div>

        <section className="mb-5" style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle><div className="flex flex-col gap-3">{data.experiences.map((exp, i) => <div key={i} style={{ pageBreakInside: "avoid" }}><div className="flex items-start justify-between"><div><p className="text-xs font-bold">{exp.title[l]}</p><p className="text-[11px]" style={{ color: palette.accent, opacity: 0.8 }}>{exp.org[l]}</p></div><span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span></div><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p></div>)}</div></section>

        <section style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle><div className="grid gap-2.5 sm:grid-cols-2">{data.projects.map((p, i) => <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}><p className="text-xs font-bold">{p.title[l]}</p><p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p><div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((t) => <span key={t} className="rounded-full border px-1.5 py-px text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{t}</span>)}</div></div>)}</div></section>
      </div>
    </div>
  )
}

// ===== SIDEBAR LAYOUT =====
function SidebarLayout({ data, palette, locale, showIcons }: Omit<Props, "layout">) {
  const l = locale
  return (
    <div className="flex min-h-full" style={{ background: palette.bg, color: palette.text }}>
      {/* Sidebar */}
      <aside className="w-[200px] shrink-0 p-6" style={{ background: palette.headingBg, color: palette.headingText }}>
        <h1 className="text-lg font-bold leading-tight">{data.name[l]}</h1>
        <p className="mt-1 text-[10px] opacity-80">{data.tagline[l]}</p>
        <hr className="my-4 opacity-20" />
        <div className="flex flex-col gap-1.5 text-[10px] opacity-80">
          <span>{data.location}</span><span>{data.email}</span><span>{data.website}</span><span>{data.github}</span>
        </div>
        <hr className="my-4 opacity-20" />
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70">{labels[l].education}</p>
        {data.education.map((e, i) => <div key={i} className="mb-2"><p className="text-[10px] font-bold leading-tight">{e.school}</p><p className="text-[9px] opacity-70">{e.period}</p></div>)}
        <hr className="my-4 opacity-20" />
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider opacity-70">{labels[l].skills}</p>
        {data.skillGroups.map((g, i) => <div key={i} className="mb-2"><p className="mb-1 text-[9px] font-bold opacity-80">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <span key={s.name} className="rounded px-1.5 py-0.5 text-[8px]" style={{ background: "rgba(255,255,255,0.15)" }}>{s.name}</span>)}</div></div>)}
      </aside>
      {/* Main */}
      <main className="flex-1 p-6 sm:p-8">
        <section className="mb-5"><SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle><p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p></section>
        <section className="mb-5" style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle><div className="flex flex-col gap-3">{data.experiences.map((exp, i) => <div key={i} style={{ pageBreakInside: "avoid" }}><div className="flex items-start justify-between"><div><p className="text-xs font-bold">{exp.title[l]}</p><p className="text-[11px]" style={{ color: palette.accent, opacity: 0.8 }}>{exp.org[l]}</p></div><span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span></div><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p></div>)}</div></section>
        <section style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle><div className="flex flex-col gap-2.5">{data.projects.map((p, i) => <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}><div className="flex items-start justify-between"><p className="text-xs font-bold">{p.title[l]}</p><p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p></div><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p></div>)}</div></section>
      </main>
    </div>
  )
}

// ===== COMPACT LAYOUT =====
function CompactLayout({ data, palette, locale, showIcons }: Omit<Props, "layout">) {
  const l = locale
  return (
    <div className="p-6 sm:p-8" style={{ background: palette.bg, color: palette.text }}>
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold">{data.name[l]}</h1>
        <p className="text-[11px]" style={{ color: palette.accent }}>{data.tagline[l]}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[10px]" style={{ color: palette.muted }}>
          <span>{data.location}</span><span>{data.email}</span><span>{data.website}</span><span>{data.github}</span>
        </div>
      </header>
      <hr className="mb-4" style={{ borderColor: palette.border }} />

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <section><SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle><p className="text-[11px] leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p></section>
        <section><SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>{labels[l].education}</SectionTitle>{data.education.map((e, i) => <div key={i} className="mb-1"><p className="text-[11px] font-bold">{e.school}</p><p className="text-[10px]" style={{ color: palette.muted }}>{e.detail[l]} &middot; {e.period}</p></div>)}</section>
      </div>
      <hr className="my-4" style={{ borderColor: palette.border }} />

      <section className="mb-4" style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle><div className="flex flex-col gap-2">{data.experiences.map((exp, i) => <div key={i} style={{ pageBreakInside: "avoid" }}><div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-bold">{exp.title[l]}<span className="font-normal" style={{ color: palette.accent }}> @ {exp.org[l]}</span></p></div><span className="whitespace-nowrap text-[10px] font-mono" style={{ color: palette.muted }}>{exp.startDate}-{exp.endDate || labels[l].now}</span></div><p className="text-[10px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p></div>)}</div></section>

      <section className="mb-4" style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle><div className="grid gap-2 sm:grid-cols-2">{data.projects.map((p, i) => <div key={i} className="rounded border p-2" style={{ borderColor: palette.border, pageBreakInside: "avoid" }}><p className="text-[11px] font-bold">{p.title[l]} <span className="font-mono font-normal text-[9px]" style={{ color: palette.muted }}>{p.date}</span></p><p className="text-[10px]" style={{ color: palette.muted }}>{p.description[l]}</p></div>)}</div></section>

      <section style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle><div className="grid gap-2 sm:grid-cols-2">{data.skillGroups.map((g, i) => <div key={i}><p className="mb-0.5 text-[10px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}</div></section>
    </div>
  )
}

// ===== TIMELINE LAYOUT =====
function TimelineLayout({ data, palette, locale, showIcons }: Omit<Props, "layout">) {
  const l = locale
  return (
    <div className="p-8 sm:p-10" style={{ background: palette.bg, color: palette.text }}>
      <header className="mb-6 border-b-2 pb-5" style={{ borderColor: palette.accent }}>
        <h1 className="text-2xl font-bold">{data.name[l]}</h1>
        <p className="text-sm" style={{ color: palette.accent }}>{data.tagline[l]}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 text-[11px]" style={{ color: palette.muted }}><span>{data.location}</span><span>{data.email}</span><span>{data.website}</span><span>{data.github}</span></div>
      </header>

      <section className="mb-5"><SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle><p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p></section>

      {/* Timeline experiences */}
      <section className="mb-5" style={{ pageBreakInside: "avoid" }}>
        <SectionTitle palette={palette} icon="mdi:timeline" showIcons={showIcons}>{labels[l].timelineTitle}</SectionTitle>
        <div className="relative ml-3 border-l-2 pl-6" style={{ borderColor: palette.accent }}>
          {[...data.education.map((e) => ({ type: "edu" as const, ...e })), ...data.experiences.map((e) => ({ type: "exp" as const, ...e }))].map((item, i) => (
            <div key={i} className="relative mb-4" style={{ pageBreakInside: "avoid" }}>
              <div className="absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2" style={{ borderColor: palette.accent, background: palette.bg }} />
              {item.type === "edu" ? (
                <><p className="text-xs font-bold">{item.school}</p><p className="text-[10px]" style={{ color: palette.muted }}>{item.detail[l]} &middot; {item.period}</p></>
              ) : (
                <><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold">{item.title[l]}</p><p className="text-[10px]" style={{ color: palette.accent, opacity: 0.8 }}>{item.org[l]}</p></div><span className="whitespace-nowrap text-[10px] font-mono" style={{ color: palette.muted }}>{item.startDate} - {item.endDate || labels[l].present}</span></div><p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{item.description[l]}</p></>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5" style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle><div className="grid gap-2.5 sm:grid-cols-2">{data.projects.map((p, i) => <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}><p className="text-xs font-bold">{p.title[l]}</p><p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p></div>)}</div></section>

      <section style={{ pageBreakInside: "avoid" }}><SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle><div className="grid gap-3 sm:grid-cols-2">{data.skillGroups.map((g, i) => <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}</div></section>
    </div>
  )
}

export function ResumeRenderer(props: Props) {
  switch (props.layout) {
    case "modern": return <ModernLayout {...props} />
    case "sidebar": return <SidebarLayout {...props} />
    case "compact": return <CompactLayout {...props} />
    case "timeline": return <TimelineLayout {...props} />
    default: return <ClassicLayout {...props} />
  }
}
