"use client"

import React from "react"

import { Icon } from "@iconify/react"
import type { ResumeData, PaletteOption, LayoutId } from "@/lib/resume-templates"
import {
  T01_BluePinkBlobs as BoldHeaderLayout,
  T09_BunnyGrass as CornerInfoLayout,
  T08_RedSidebar as DarkSidebarLayout,
  T10_BrownPinkCards as IconGridLayout,
  T12_YellowTable as FormalTableLayout,
  T11_GridChibi as BracketLayout,
  T02_HelloGradient as HelloSplitLayout,
  T03_MinimalBluePhoto as SerifBlueLayout,
  T04_PurpleWave as UnderlineLayout,
  T05_DarkHeaderTable as ProTableLayout,
  T06_CuteDoodle as PlayfulLayout,
  T07_TealPinkCard as FloraLayout,
} from "./resume-renderer-extra"


interface Props {
  data: ResumeData
  palette: PaletteOption
  layout: LayoutId
  locale: "zh" | "en"
  showIcons: boolean
  fontScale?: number
  activeSection?: string | null
  onSectionClick?: (section: string) => void
}

// Localized labels for resume sections
const labels = {
  zh: {
    personalSummary: "个人简介",
    education: "教育经历",
    experience: "经验",
    projects: "项目",
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

// Helper: clickable section wrapper for inline editing
function Section({ id, active, onClick, children, className, style }: { id: string; active?: boolean; onClick?: (s: string) => void; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <section
      data-section={id}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(id) } : undefined}
      className={`${className || ""} ${onClick ? "cursor-pointer transition-all duration-150" : ""} ${active ? "ring-2 ring-blue-400/60 ring-offset-1 rounded-lg" : onClick ? "hover:ring-1 hover:ring-blue-300/30 hover:rounded-lg" : ""}`}
      style={{ ...style, pageBreakInside: "avoid" }}
    >
      {children}
    </section>
  )
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

// Contact info helper -- now supports multi-email + social links
function ContactInfo({ data, palette, showIcons, direction = "column" }: { data: ResumeData; palette: PaletteOption; showIcons: boolean; direction?: "row" | "column" }) {
  const items: { icon: string; value: string }[] = []
  if (data.location) items.push({ icon: "mdi:map-marker-outline", value: data.location })
  // primary email (backward compat)
  if (data.email) items.push({ icon: "mdi:email-outline", value: data.email })
  // additional emails
  if (data.emails?.length) data.emails.forEach((e) => { if (e.address) items.push({ icon: "mdi:email-outline", value: e.address }) })
  if (data.phone) items.push({ icon: "mdi:phone-outline", value: data.phone })
  if (data.website) items.push({ icon: "mdi:web", value: data.website })
  if (data.github) items.push({ icon: "mdi:github", value: data.github })
  if (data.linkedin) items.push({ icon: "mdi:linkedin", value: data.linkedin })
  // social links
  if (data.socialLinks?.length) data.socialLinks.forEach((s) => { if (s.url) items.push({ icon: s.icon || "mdi:link", value: s.url }) })

  if (!items.length) return null

  return (
    <div className={`flex ${direction === "row" ? "flex-wrap gap-x-4 gap-y-1" : "flex-col gap-1"} text-[11px]`} style={{ color: palette.muted }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {showIcons && <Icon icon={item.icon} className="h-3 w-3 shrink-0" />}
          {item.value}
        </span>
      ))}
    </div>
  )
}

// Flat contact items for header row style
function contactFlat(data: ResumeData): string[] {
  const items: string[] = []
  if (data.location) items.push(data.location)
  if (data.email) items.push(data.email)
  if (data.emails?.length) data.emails.forEach((e) => { if (e.address) items.push(e.address) })
  if (data.phone) items.push(data.phone)
  if (data.website) items.push(data.website)
  if (data.github) items.push(data.github)
  if (data.linkedin) items.push(data.linkedin)
  if (data.socialLinks?.length) data.socialLinks.forEach((s) => { if (s.url) items.push(s.url) })
  return items
}

// Custom sections renderer -- now supports list / text / cards / tags
function CustomSections({ sections, palette, locale, showIcons, activeSection, onSectionClick }: { sections: ResumeData["customSections"]; palette: PaletteOption; locale: "zh" | "en"; showIcons: boolean; activeSection?: string | null; onSectionClick?: (s: string) => void }) {
  if (!sections?.length) return null
  return (
    <>
      {sections.map((s) => {
        const nonEmpty = s.items.filter(Boolean)
        if (!nonEmpty.length) return null
        const sIcon = s.icon || "mdi:star-outline"
        const sType = s.type || "list"
        return (
          <Section key={s.id} id="custom" active={activeSection === "custom"} onClick={onSectionClick} className="mb-5">
            <SectionTitle palette={palette} icon={sIcon} showIcons={showIcons}>
              {s.title[locale] || s.title.en || s.title.zh}
            </SectionTitle>
            {sType === "list" && (
              <ul className="ml-4 list-disc space-y-0.5">
                {nonEmpty.map((item, i) => <li key={i} className="text-[11px] leading-relaxed" style={{ color: palette.muted }}>{item}</li>)}
              </ul>
            )}
            {sType === "text" && (
              <div className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: palette.muted }}>
                {nonEmpty.join("\n")}
              </div>
            )}
            {sType === "cards" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {nonEmpty.map((item, i) => (
                  <div key={i} className="rounded-lg border p-3 text-[11px] leading-relaxed" style={{ background: palette.cardBg, borderColor: palette.border, color: palette.muted }}>{item}</div>
                ))}
              </div>
            )}
            {sType === "tags" && (
              <div className="flex flex-wrap gap-1.5">
                {nonEmpty.map((item, i) => (
                  <span key={i} className="inline-block rounded-full border px-2.5 py-0.5 text-[10px]" style={{ borderColor: palette.border, color: palette.muted }}>{item}</span>
                ))}
              </div>
            )}
          </Section>
        )
      })}
    </>
  )
}

// ── Safe degree accessor -- handles old string format from localStorage ──
function deg(d: { zh: string; en: string } | string | undefined, l: "zh" | "en"): string {
  if (!d) return ""
  if (typeof d === "string") return d
  return d[l] || ""
}

// ===== CLASSIC LAYOUT =====
function ClassicLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale
  const sc = onSectionClick
  return (
    <div className="flex min-h-full flex-col p-8 sm:p-10" style={{ background: palette.bg, color: palette.text }}>
      <Section id="basic" active={activeSection === "basic"} onClick={sc}>
        <header className="mb-6 border-b pb-5" style={{ borderColor: palette.border }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{data.name[l]}</h1>
              <p className="mt-0.5 text-sm" style={{ color: palette.accent }}>{data.tagline[l]}</p>
            </div>
            <ContactInfo data={data} palette={palette} showIcons={showIcons} />
          </div>
        </header>
      </Section>

      {data.summary[l] && (
        <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-5">
          <SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle>
          <p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p>
        </Section>
      )}

      {data.education.length > 0 && (
        <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-5">
          <SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>{labels[l].education}</SectionTitle>
          <div className="flex flex-col gap-2">
            {data.education.map((e, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold">{e.school}</p>
                  <p className="text-[11px]" style={{ color: palette.muted }}>
                    {deg(e.degree, l) ? `${deg(e.degree, l)} - ` : ""}{typeof e.detail === "string" ? e.detail : e.detail[l]}
                  </p>
                </div>
                <span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{e.period}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.experiences.length > 0 && (
        <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
          <SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle>
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
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-5">
          <SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data.projects.map((p, i) => (
              <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}>
                <p className="text-xs font-bold">{p.title[l]}</p>
                <p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((tag) => <span key={tag} className="rounded-full border px-1.5 py-px text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{tag}</span>)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.skillGroups.length > 0 && (
        <Section id="skills" active={activeSection === "skills"} onClick={sc}>
          <SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.skillGroups.map((g, i) => (
              <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>
            ))}
          </div>
        </Section>
      )}

      <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
    </div>
  )
}

// ===== MODERN LAYOUT =====
function ModernLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full flex-col" style={{ background: palette.bg, color: palette.text }}>
      <Section id="basic" active={activeSection === "basic"} onClick={sc}>
        <header className="px-8 py-8 sm:px-10" style={{ background: palette.headingBg, color: palette.headingText }}>
          <h1 className="text-3xl font-bold">{data.name[l]}</h1>
          <p className="mt-1 text-sm opacity-90">{data.tagline[l]}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] opacity-80">
            {contactFlat(data).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </header>
      </Section>

      <div className="p-8 sm:p-10">
        {data.summary[l] && (
          <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-5">
            <SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle>
            <p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p>
          </Section>
        )}

        <div className="mb-5 grid gap-5 sm:grid-cols-2">
          {data.education.length > 0 && (
            <Section id="education" active={activeSection === "education"} onClick={sc}>
              <SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>{labels[l].education}</SectionTitle>
              <div className="flex flex-col gap-2">{data.education.map((e, i) => <div key={i}><p className="text-xs font-bold">{e.school}</p><p className="text-[11px]" style={{ color: palette.muted }}>{deg(e.degree, l) ? `${deg(e.degree, l)} - ` : ""}{typeof e.detail === "string" ? e.detail : e.detail[l]} &middot; {e.period}</p></div>)}</div>
            </Section>
          )}
          {data.skillGroups.length > 0 && (
            <Section id="skills" active={activeSection === "skills"} onClick={sc}>
              <SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle>
              <div className="flex flex-col gap-2">{data.skillGroups.map((g, i) => <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}</div>
            </Section>
          )}
        </div>

        {data.experiences.length > 0 && (
          <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
            <SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle>
            <div className="flex flex-col gap-3">{data.experiences.map((exp, i) => <div key={i} style={{ pageBreakInside: "avoid" }}><div className="flex items-start justify-between"><div><p className="text-xs font-bold">{exp.title[l]}</p><p className="text-[11px]" style={{ color: palette.accent, opacity: 0.8 }}>{exp.org[l]}</p></div><span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span></div><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p></div>)}</div>
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section id="projects" active={activeSection === "projects"} onClick={sc}>
            <SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle>
            <div className="grid gap-2.5 sm:grid-cols-2">{data.projects.map((p, i) => <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}><p className="text-xs font-bold">{p.title[l]}</p><p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p><div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((tag) => <span key={tag} className="rounded-full border px-1.5 py-px text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{tag}</span>)}</div></div>)}</div>
          </Section>
        )}

        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
      </div>
    </div>
  )
}

// ===== SIDEBAR LAYOUT =====
function SidebarLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full" style={{ background: palette.bg, color: palette.text }}>
      <aside className="w-[200px] shrink-0 p-6" style={{ background: palette.headingBg, color: palette.headingText }}>
        <Section id="basic" active={activeSection === "basic"} onClick={sc}>
          <h1 className="text-lg font-bold leading-tight">{data.name[l]}</h1>
          <p className="mt-1 text-[10px] opacity-80">{data.tagline[l]}</p>
          <hr className="my-4 opacity-20" />
          <div className="flex flex-col gap-1.5 text-[10px] opacity-80">
            {contactFlat(data).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </Section>
        {data.education.length > 0 && (<>
          <hr className="my-4 opacity-20" />
          <Section id="education" active={activeSection === "education"} onClick={sc}>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70">{labels[l].education}</p>
            {data.education.map((e, i) => <div key={i} className="mb-2"><p className="text-[10px] font-bold leading-tight">{e.school}</p><p className="text-[9px] opacity-70">{e.period}</p></div>)}
          </Section>
        </>)}
        {data.skillGroups.length > 0 && (<>
          <hr className="my-4 opacity-20" />
          <Section id="skills" active={activeSection === "skills"} onClick={sc}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider opacity-70">{labels[l].skills}</p>
            {data.skillGroups.map((g, i) => <div key={i} className="mb-2"><p className="mb-1 text-[9px] font-bold opacity-80">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <span key={s.name} className="rounded px-1.5 py-0.5 text-[8px]" style={{ background: "rgba(255,255,255,0.15)" }}>{s.name}</span>)}</div></div>)}
          </Section>
        </>)}
      </aside>
      <main className="flex-1 p-6 sm:p-8">
        {data.summary[l] && (
          <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-5">
            <SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle>
            <p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p>
          </Section>
        )}
        {data.experiences.length > 0 && (
          <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
            <SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle>
            <div className="flex flex-col gap-3">{data.experiences.map((exp, i) => <div key={i} style={{ pageBreakInside: "avoid" }}><div className="flex items-start justify-between"><div><p className="text-xs font-bold">{exp.title[l]}</p><p className="text-[11px]" style={{ color: palette.accent, opacity: 0.8 }}>{exp.org[l]}</p></div><span className="whitespace-nowrap text-[11px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span></div><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p></div>)}</div>
          </Section>
        )}
        {data.projects.length > 0 && (
          <Section id="projects" active={activeSection === "projects"} onClick={sc}>
            <SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle>
            <div className="flex flex-col gap-2.5">{data.projects.map((p, i) => <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}><div className="flex items-start justify-between"><p className="text-xs font-bold">{p.title[l]}</p><p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p></div><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p></div>)}</div>
          </Section>
        )}
        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
      </main>
    </div>
  )
}

// ===== COMPACT LAYOUT =====
function CompactLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full flex-col p-6 sm:p-8" style={{ background: palette.bg, color: palette.text }}>
      <Section id="basic" active={activeSection === "basic"} onClick={sc}>
        <header className="mb-4 text-center">
          <h1 className="text-xl font-bold">{data.name[l]}</h1>
          <p className="text-[11px]" style={{ color: palette.accent }}>{data.tagline[l]}</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[10px]" style={{ color: palette.muted }}>
            {contactFlat(data).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </header>
      </Section>
      <hr className="mb-4" style={{ borderColor: palette.border }} />
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {data.summary[l] && <Section id="summary" active={activeSection === "summary"} onClick={sc}><SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle><p className="text-[11px] leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p></Section>}
        {data.education.length > 0 && <Section id="education" active={activeSection === "education"} onClick={sc}><SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>{labels[l].education}</SectionTitle>{data.education.map((e, i) => <div key={i} className="mb-1"><p className="text-[11px] font-bold">{e.school}</p><p className="text-[10px]" style={{ color: palette.muted }}>{deg(e.degree, l) ? `${deg(e.degree, l)} - ` : ""}{typeof e.detail === "string" ? e.detail : e.detail[l]} &middot; {e.period}</p></div>)}</Section>}
      </div>
      <hr className="my-4" style={{ borderColor: palette.border }} />
      {data.experiences.length > 0 && <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-4"><SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle><div className="flex flex-col gap-2">{data.experiences.map((exp, i) => <div key={i} style={{ pageBreakInside: "avoid" }}><div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-bold">{exp.title[l]}<span className="font-normal" style={{ color: palette.accent }}> @ {exp.org[l]}</span></p></div><span className="whitespace-nowrap text-[10px] font-mono" style={{ color: palette.muted }}>{exp.startDate}-{exp.endDate || labels[l].now}</span></div><p className="text-[10px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p></div>)}</div></Section>}
      {data.projects.length > 0 && <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-4"><SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle><div className="grid gap-2 sm:grid-cols-2">{data.projects.map((p, i) => <div key={i} className="rounded border p-2" style={{ borderColor: palette.border, pageBreakInside: "avoid" }}><p className="text-[11px] font-bold">{p.title[l]} <span className="font-mono font-normal text-[9px]" style={{ color: palette.muted }}>{p.date}</span></p><p className="text-[10px]" style={{ color: palette.muted }}>{p.description[l]}</p></div>)}</div></Section>}
      {data.skillGroups.length > 0 && <Section id="skills" active={activeSection === "skills"} onClick={sc}><SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle><div className="grid gap-2 sm:grid-cols-2">{data.skillGroups.map((g, i) => <div key={i}><p className="mb-0.5 text-[10px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}</div></Section>}
      <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
    </div>
  )
}

// ===== TIMELINE LAYOUT =====
function TimelineLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full flex-col p-8 sm:p-10" style={{ background: palette.bg, color: palette.text }}>
      <Section id="basic" active={activeSection === "basic"} onClick={sc}>
        <header className="mb-6 border-b-2 pb-5" style={{ borderColor: palette.accent }}>
          <h1 className="text-2xl font-bold">{data.name[l]}</h1>
          <p className="text-sm" style={{ color: palette.accent }}>{data.tagline[l]}</p>
          <ContactInfo data={data} palette={palette} showIcons={showIcons} direction="row" />
        </header>
      </Section>
      {data.summary[l] && <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-5"><SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle><p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p></Section>}
      {(data.education.length > 0 || data.experiences.length > 0) && (
        <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
          <SectionTitle palette={palette} icon="mdi:timeline" showIcons={showIcons}>{labels[l].timelineTitle}</SectionTitle>
          <div className="relative ml-3 border-l-2 pl-6" style={{ borderColor: palette.accent }}>
            {[...data.education.map((e) => ({ type: "edu" as const, ...e })), ...data.experiences.map((e) => ({ type: "exp" as const, ...e }))].map((item, i) => (
              <div key={i} className="relative mb-4" style={{ pageBreakInside: "avoid" }}>
                <div className="absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2" style={{ borderColor: palette.accent, background: palette.bg }} />
                {item.type === "edu" ? (
                  <><p className="text-xs font-bold">{item.school}</p><p className="text-[10px]" style={{ color: palette.muted }}>{typeof item.detail === "string" ? item.detail : item.detail[l]} &middot; {item.period}</p></>
                ) : (
                  <><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold">{item.title[l]}</p><p className="text-[10px]" style={{ color: palette.accent, opacity: 0.8 }}>{item.org[l]}</p></div><span className="whitespace-nowrap text-[10px] font-mono" style={{ color: palette.muted }}>{item.startDate} - {item.endDate || labels[l].present}</span></div><p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{item.description[l]}</p></>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
      {data.projects.length > 0 && <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-5"><SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle><div className="grid gap-2.5 sm:grid-cols-2">{data.projects.map((p, i) => <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}><p className="text-xs font-bold">{p.title[l]}</p><p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p><p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p></div>)}</div></Section>}
      {data.skillGroups.length > 0 && <Section id="skills" active={activeSection === "skills"} onClick={sc}><SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle><div className="grid gap-3 sm:grid-cols-2">{data.skillGroups.map((g, i) => <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}</div></Section>}
      <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
    </div>
  )
}

// ===== ELEGANT LAYOUT =====
function ElegantLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full flex-col p-8 sm:p-10" style={{ background: palette.bg, color: palette.text }}>
      <div className="mb-6 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${palette.accent}, transparent)` }} />
      <Section id="basic" active={activeSection === "basic"} onClick={sc}>
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-light tracking-wide" style={{ color: palette.text }}>{data.name[l]}</h1>
          <div className="mx-auto mt-2 h-px w-16" style={{ background: palette.accent }} />
          <p className="mt-2 text-sm font-light tracking-wide" style={{ color: palette.accent }}>{data.tagline[l]}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px]" style={{ color: palette.muted }}>
            {contactFlat(data).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </header>
      </Section>

      {data.summary[l] && (
        <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-6">
          <div className="rounded-lg border p-4" style={{ borderColor: palette.border, background: palette.cardBg }}>
            <SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle>
            <p className="text-xs italic leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p>
          </div>
        </Section>
      )}

      {data.education.length > 0 && (
        <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-6">
          <SectionTitle palette={palette} icon="mdi:school-outline" showIcons={showIcons}>{labels[l].education}</SectionTitle>
          <div className="flex flex-col gap-2 border-l-2 pl-4" style={{ borderColor: palette.accent }}>
            {data.education.map((e, i) => (
              <div key={i}>
                <p className="text-xs font-bold">{e.school}</p>
                <p className="text-[11px]" style={{ color: palette.muted }}>{deg(e.degree, l) ? `${deg(e.degree, l)} - ` : ""}{typeof e.detail === "string" ? e.detail : e.detail[l]} &middot; {e.period}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.experiences.length > 0 && (
        <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-6">
          <SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle>
          <div className="flex flex-col gap-4">
            {data.experiences.map((exp, i) => (
              <div key={i} className="rounded-lg border p-4" style={{ borderColor: palette.border, background: palette.cardBg, pageBreakInside: "avoid" }}>
                <div className="flex items-start justify-between">
                  <div><p className="text-xs font-bold">{exp.title[l]}</p><p className="text-[11px]" style={{ color: palette.accent }}>{exp.org[l]}</p></div>
                  <span className="whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-6">
          <SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.projects.map((p, i) => (
              <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}>
                <p className="text-xs font-bold">{p.title[l]}</p>
                <p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((tag) => <span key={tag} className="rounded-full border px-1.5 py-px text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{tag}</span>)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.skillGroups.length > 0 && (
        <Section id="skills" active={activeSection === "skills"} onClick={sc}>
          <SectionTitle palette={palette} icon="mdi:code-tags" showIcons={showIcons}>{labels[l].skills}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.skillGroups.map((g, i) => <div key={i}><p className="mb-1 text-[11px] font-bold">{g.label[l]}</p><div className="flex flex-wrap gap-1">{g.items.map((s) => <SkillTag key={s.name} name={s.name} icon={s.icon} palette={palette} showIcons={showIcons} />)}</div></div>)}
          </div>
        </Section>
      )}

      <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
      <div className="mt-6 h-1 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${palette.accent})` }} />
    </div>
  )
}

// ===== MINIMAL LAYOUT =====
function MinimalLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full flex-col p-10 sm:p-14" style={{ background: palette.bg, color: palette.text }}>
      <Section id="basic" active={activeSection === "basic"} onClick={sc}>
        <header className="mb-10">
          <h1 className="text-4xl font-extralight tracking-tight">{data.name[l]}</h1>
          <p className="mt-1 text-sm font-light tracking-wide" style={{ color: palette.muted }}>{data.tagline[l]}</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color: palette.muted }}>
            {contactFlat(data).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </header>
      </Section>

      {data.summary[l] && <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-8"><p className="text-xs leading-loose" style={{ color: palette.muted }}>{data.summary[l]}</p></Section>}

      {data.experiences.length > 0 && (
        <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-8">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: palette.accent }}>{labels[l].experience}</h2>
          <div className="flex flex-col gap-5">
            {data.experiences.map((exp, i) => (
              <div key={i} style={{ pageBreakInside: "avoid" }}>
                <div className="flex items-baseline justify-between"><p className="text-sm font-medium">{exp.title[l]}</p><span className="text-[10px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span></div>
                <p className="text-[11px]" style={{ color: palette.accent }}>{exp.org[l]}</p>
                <p className="mt-1.5 text-[11px] leading-loose" style={{ color: palette.muted }}>{exp.description[l]}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.education.length > 0 && (
        <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-8">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: palette.accent }}>{labels[l].education}</h2>
          {data.education.map((e, i) => (
            <div key={i} className="mb-2 flex items-baseline justify-between">
              <div><p className="text-sm font-medium">{e.school}</p><p className="text-[11px]" style={{ color: palette.muted }}>{deg(e.degree, l) ? `${deg(e.degree, l)} - ` : ""}{typeof e.detail === "string" ? e.detail : e.detail[l]}</p></div>
              <span className="text-[10px] font-mono" style={{ color: palette.muted }}>{e.period}</span>
            </div>
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-8">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: palette.accent }}>{labels[l].projects}</h2>
          <div className="flex flex-col gap-4">
            {data.projects.map((p, i) => (
              <div key={i} style={{ pageBreakInside: "avoid" }}>
                <div className="flex items-baseline justify-between"><p className="text-sm font-medium">{p.title[l]}</p><span className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</span></div>
                <p className="mt-1 text-[11px] leading-loose" style={{ color: palette.muted }}>{p.description[l]}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.skillGroups.length > 0 && (
        <Section id="skills" active={activeSection === "skills"} onClick={sc}>
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: palette.accent }}>{labels[l].skills}</h2>
          <div className="flex flex-wrap gap-2">
            {data.skillGroups.flatMap((g) => g.items).map((s) => (
              <span key={s.name} className="text-[11px]" style={{ color: palette.muted }}>{s.name}</span>
            ))}
          </div>
        </Section>
      )}

      <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
    </div>
  )
}

// ===== CREATIVE LAYOUT =====
function CreativeLayout({ data, palette, locale, showIcons, activeSection, onSectionClick }: Omit<Props, "layout" | "fontScale">) {
  const l = locale; const sc = onSectionClick
  return (
    <div className="flex min-h-full" style={{ background: palette.bg, color: palette.text }}>
      <aside className="w-[240px] shrink-0 p-7" style={{ background: palette.headingBg, color: palette.headingText }}>
        <Section id="basic" active={activeSection === "basic"} onClick={sc}>
          <div className="mb-6">
            <h1 className="text-2xl font-black leading-tight tracking-tight">{data.name[l]}</h1>
            <p className="mt-2 text-xs opacity-80">{data.tagline[l]}</p>
          </div>
          <div className="mb-6 flex flex-col gap-2 text-[10px] opacity-80">
            {[
              { icon: "mdi:map-marker", value: data.location },
              { icon: "mdi:email", value: data.email },
              ...(data.emails || []).filter((e) => e.address).map((e) => ({ icon: "mdi:email", value: e.address })),
              { icon: "mdi:phone", value: data.phone },
              { icon: "mdi:web", value: data.website },
              { icon: "mdi:github", value: data.github },
              { icon: "mdi:linkedin", value: data.linkedin },
              ...(data.socialLinks || []).filter((s) => s.url).map((s) => ({ icon: s.icon || "mdi:link", value: s.url })),
            ].filter((i) => i.value).map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {showIcons && <Icon icon={item.icon} className="h-3 w-3" />}
                {item.value}
              </span>
            ))}
          </div>
        </Section>

        {data.skillGroups.length > 0 && (<>
          <div className="mb-5 h-px opacity-20" style={{ background: palette.headingText }} />
          <Section id="skills" active={activeSection === "skills"} onClick={sc}>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">{labels[l].skills}</p>
            {data.skillGroups.map((g, i) => (
              <div key={i} className="mb-3">
                <p className="mb-1 text-[10px] font-bold opacity-85">{g.label[l]}</p>
                <div className="flex flex-col gap-1">
                  {g.items.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      {showIcons && s.icon && <Icon icon={s.icon} className="h-3 w-3" />}
                      <span className="text-[9px]">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        </>)}

        {data.education.length > 0 && (<>
          <div className="mb-5 h-px opacity-20" style={{ background: palette.headingText }} />
          <Section id="education" active={activeSection === "education"} onClick={sc}>
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">{labels[l].education}</p>
            {data.education.map((e, i) => (
              <div key={i} className="mb-3">
                <p className="text-[10px] font-bold">{e.school}</p>
                <p className="text-[9px] opacity-70">{deg(e.degree, l) || (typeof e.detail === "string" ? e.detail : e.detail[l])}</p>
                <p className="text-[9px] opacity-50">{e.period}</p>
              </div>
            ))}
          </Section>
        </>)}
      </aside>

      <main className="flex-1 p-7">
        {data.summary[l] && (
          <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-6">
            <div className="rounded-lg p-4" style={{ background: `${palette.accent}10` }}>
              <SectionTitle palette={palette} icon="mdi:account-outline" showIcons={showIcons}>{labels[l].personalSummary}</SectionTitle>
              <p className="text-xs leading-relaxed" style={{ color: palette.muted }}>{data.summary[l]}</p>
            </div>
          </Section>
        )}

        {data.experiences.length > 0 && (
          <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-6">
            <SectionTitle palette={palette} icon="mdi:briefcase-outline" showIcons={showIcons}>{labels[l].experience}</SectionTitle>
            <div className="flex flex-col gap-4">
              {data.experiences.map((exp, i) => (
                <div key={i} className="relative pl-4" style={{ pageBreakInside: "avoid" }}>
                  <div className="absolute left-0 top-1 h-2 w-2 rounded-full" style={{ background: palette.accent }} />
                  <div className="flex items-start justify-between">
                    <div><p className="text-xs font-bold">{exp.title[l]}</p><p className="text-[11px]" style={{ color: palette.accent }}>{exp.org[l]}</p></div>
                    <span className="whitespace-nowrap text-[10px] font-mono" style={{ color: palette.muted }}>{exp.startDate} - {exp.endDate || labels[l].present}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{exp.description[l]}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section id="projects" active={activeSection === "projects"} onClick={sc}>
            <SectionTitle palette={palette} icon="mdi:folder-outline" showIcons={showIcons}>{labels[l].projects}</SectionTitle>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {data.projects.map((p, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ background: palette.cardBg, borderColor: palette.border, pageBreakInside: "avoid" }}>
                  <p className="text-xs font-bold">{p.title[l]}</p>
                  <p className="text-[10px] font-mono" style={{ color: palette.muted }}>{p.date}</p>
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.muted }}>{p.description[l]}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">{p.tags.map((tag) => <span key={tag} className="rounded-full border px-1.5 py-px text-[9px] font-mono" style={{ borderColor: palette.border, color: palette.muted }}>{tag}</span>)}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
      </main>
    </div>
  )
}

export function ResumeRenderer(props: Props) {
  const { fontScale = 100, ...rest } = props
  const inner = (() => {
    switch (props.layout) {
      case "modern": return <ModernLayout {...rest} />
      case "sidebar": return <SidebarLayout {...rest} />
      case "compact": return <CompactLayout {...rest} />
      case "timeline": return <TimelineLayout {...rest} />
      case "elegant": return <ElegantLayout {...rest} />
      case "minimal": return <MinimalLayout {...rest} />
      case "creative": return <CreativeLayout {...rest} />
      case "bold-header": return <BoldHeaderLayout {...rest} />
      case "corner-info": return <CornerInfoLayout {...rest} />
      case "dark-sidebar": return <DarkSidebarLayout {...rest} />
      case "icon-grid": return <IconGridLayout {...rest} />
      case "formal-table": return <FormalTableLayout {...rest} />
      case "bracket": return <BracketLayout {...rest} />
      case "hello-split": return <HelloSplitLayout {...rest} />
      case "serif-blue": return <SerifBlueLayout {...rest} />
      case "underline": return <UnderlineLayout {...rest} />
      case "pro-table": return <ProTableLayout {...rest} />
      case "playful": return <PlayfulLayout {...rest} />
      case "flora": return <FloraLayout {...rest} />
      default: return <ClassicLayout {...rest} />
    }
  })()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: fontScale !== 100 ? `${fontScale}%` : undefined }}>
      {inner}
    </div>
  )
}
