"use client"

import React from "react"
import { Icon } from "@iconify/react"
import type { ResumeData, PaletteOption } from "@/lib/resume-templates"

// Helper: renders text with markdown-like formatting (bullet points via "- ", line breaks via "\n", pipe separators)
function FormattedText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  if (!text) return null
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let bulletItems: string[] = []
  let keyIdx = 0

  const flushBullets = () => {
    if (bulletItems.length > 0) {
      elements.push(
        <ul key={keyIdx++} className="ml-4 list-disc space-y-0.5">
          {bulletItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
        </ul>
      )
      bulletItems = []
    }
  }

  const renderInline = (s: string): React.ReactNode => {
    if (!s.includes('|')) return s
    const parts = s.split('|')
    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span className="mx-1 opacity-50">|</span>}
        {part.trim()}
      </React.Fragment>
    ))
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^[-•*]\s/.test(trimmed)) {
      bulletItems.push(trimmed.replace(/^[-•*]\s+/, ''))
    } else {
      flushBullets()
      elements.push(<div key={keyIdx++}>{renderInline(trimmed)}</div>)
    }
  }
  flushBullets()

  if (elements.length === 0) return null
  return <div className={className} style={style}>{elements}</div>
}

interface LayoutProps {
  data: ResumeData
  palette: PaletteOption
  locale: "zh" | "en"
  showIcons: boolean
  activeSection?: string | null
  onSectionClick?: (section: string) => void
}

const labels = {
  zh: {
    summary: "个人简介",
    education: "教育经历",
    experience: "经历",
    projects: "项目",
    skills: "技能",
    present: "至今",
    awards: "获奖荣誉",
    profile: "自我评价",
    info: "个人信息",
    intention: "求职意向",
    contact: "联系方式",
  },
  en: {
    summary: "Summary",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    present: "Present",
    awards: "Awards",
    profile: "Profile",
    info: "Info",
    intention: "Target Role",
    contact: "Contact",
  },
}

function Section({
  id,
  active,
  onClick,
  children,
  className,
  style,
}: {
  id: string
  active?: boolean
  onClick?: (s: string) => void
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <section
      data-section={id}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation()
              onClick(id)
            }
          : undefined
      }
      className={`${className || ""} ${onClick ? "cursor-pointer transition-all duration-150" : ""} ${
        active
          ? "ring-2 ring-blue-400/60 ring-offset-1 rounded-lg"
          : onClick
            ? "hover:ring-1 hover:ring-blue-300/30 hover:rounded-lg"
            : ""
      }`}
      style={{ ...style, pageBreakInside: "avoid" }}
    >
      {children}
    </section>
  )
}

function deg(d: { zh: string; en: string } | string | undefined, l: "zh" | "en"): string {
  if (!d) return ""
  if (typeof d === "string") return d
  return d[l] || ""
}

function contactItems(data: ResumeData): { icon: string; value: string }[] {
  const items: { icon: string; value: string }[] = []
  if (data.location) items.push({ icon: "mdi:map-marker-outline", value: data.location })
  if (data.email) items.push({ icon: "mdi:email-outline", value: data.email })
  if (data.emails?.length) data.emails.forEach((e) => e.address && items.push({ icon: "mdi:email-outline", value: e.address }))
  if (data.phone) items.push({ icon: "mdi:phone-outline", value: data.phone })
  if (data.website) items.push({ icon: "mdi:web", value: data.website })
  if (data.github) items.push({ icon: "mdi:github", value: data.github })
  if (data.linkedin) items.push({ icon: "mdi:linkedin", value: data.linkedin })
  if (data.socialLinks?.length) data.socialLinks.forEach((s) => s.url && items.push({ icon: s.icon || "mdi:link", value: s.url }))
  return items
}

function CustomSections({
  sections,
  palette,
  locale,
  showIcons,
  activeSection,
  onSectionClick,
  headingStyle,
}: {
  sections: ResumeData["customSections"]
  palette: PaletteOption
  locale: "zh" | "en"
  showIcons: boolean
  activeSection?: string | null
  onSectionClick?: (s: string) => void
  headingStyle?: React.CSSProperties
}) {
  if (!sections?.length) return null
  return (
    <>
      {sections.map((s) => {
        const nonEmpty = s.items.filter(Boolean)
        if (!nonEmpty.length) return null
        return (
          <Section key={s.id} id="custom" active={activeSection === "custom"} onClick={onSectionClick} className="mb-4">
            <h3
              className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              style={headingStyle || { color: palette.accent }}
            >
              {showIcons && <Icon icon={s.icon || "mdi:star-outline"} className="h-3.5 w-3.5" />}
              {s.title[locale] || s.title.en}
            </h3>
            {s.type === "tags" ? (
              <div className="flex flex-wrap gap-1.5">
                {nonEmpty.map((item, i) => (
                  <span key={i} className="inline-block rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: palette.border, color: palette.muted }}>{item}</span>
                ))}
              </div>
            ) : s.type === "cards" ? (
              <div className="grid gap-2 grid-cols-2">
                {nonEmpty.map((item, i) => (
                  <div key={i} className="rounded-lg border p-2.5 text-[11px]" style={{ background: palette.cardBg, borderColor: palette.border, color: palette.muted }}>{item}</div>
                ))}
              </div>
            ) : s.type === "text" ? (
              <p className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: palette.muted }}>{nonEmpty.join("\n")}</p>
            ) : (
              <ul className="ml-4 list-disc space-y-0.5">
                {nonEmpty.map((item, i) => (
                  <li key={i} className="text-[11px] leading-relaxed" style={{ color: palette.muted }}>{item}</li>
                ))}
              </ul>
            )}
          </Section>
        )
      })}
    </>
  )
}

/** Heading with bracket style */
function BracketTitle({ text, color }: { text: string; color: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <div className="h-4 w-1 rounded-full" style={{ background: color }} />
      <h3 className="text-[12px] font-extrabold tracking-wide" style={{ color }}>{text}</h3>
    </div>
  )
}

/** Progress bar */
function Bar({ value = 70, color, bgColor, height = 6 }: { value?: number; color: string; bgColor: string; height?: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ height, background: bgColor }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} />
    </div>
  )
}

/** Derive skill bars from skillGroups - assigns evenly spaced values */
function deriveSkillBars(data: ResumeData, max = 6): { name: string; value: number }[] {
  const allSkills = data.skillGroups?.flatMap((g) => g.items) || []
  return allSkills.slice(0, max).map((s, i) => ({
    name: s.name,
    value: Math.max(50, 95 - i * 8),
  }))
}

/** Rating dots component */
function RatingDots({ value = 3, total = 5, color, bgColor }: { value?: number; total?: number; color: string; bgColor: string }) {
  const v = Math.max(0, Math.min(total, value))
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="inline-block h-2 w-2 rounded-full" style={{ background: i < v ? color : bgColor }} />
      ))}
    </div>
  )
}


/* =======================================================================================
   T01: Blue/Pink Blobs - Left info + right content, decorative corner blobs
======================================================================================= */
export function T01_BluePinkBlobs({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const blue = "#1f4dff"
  const pink = "#ff7aa2"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "#fff", color: "#1a1a2e" }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-[48px] opacity-90" style={{ background: blue }} />
      <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-[60px] opacity-80" style={{ background: blue }} />
      <div className="pointer-events-none absolute -bottom-8 -right-14 h-44 w-44 rounded-[64px] opacity-70" style={{ background: pink }} />

      {/* Header */}
      <div className="relative px-8 pt-8 pb-2">
        <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex items-center gap-4">
          {data.avatar && (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: "#e0e0e0" }}>
              <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[20px] font-black tracking-wide">{data.name[l]}</div>
            <div className="mt-0.5 text-[12px] font-semibold" style={{ color: blue }}>{data.tagline?.[l] || ""}</div>
          </div>
        </Section>
      </div>

      {/* Body: 2 columns */}
      <div className="relative flex flex-1 gap-8 px-8 pb-8 pt-4">
        {/* Left column */}
        <div className="w-[220px] shrink-0">
          <Section id="info" active={activeSection === "info"} onClick={sc}>
            <div className="space-y-1.5 text-[10.5px]" style={{ color: "#555" }}>
              {contactItems(data).slice(0, 6).map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: blue }} />}
                  <span className="break-all leading-tight">{it.value}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mt-5">
            <BracketTitle text={labels[l].profile} color={blue} />
            <p className="text-[10.5px] leading-relaxed" style={{ color: "#555" }}>{data.summary?.[l] || ""}</p>
          </Section>

          <Section id="skills" active={activeSection === "skills"} onClick={sc} className="mt-5">
            <BracketTitle text={labels[l].skills} color={blue} />
            <div className="flex flex-wrap gap-1.5">
              {(data.skillGroups?.flatMap((g) => g.items) || []).slice(0, 10).map((s, i) => (
                <span key={i} className="inline-block rounded-full px-2.5 py-0.5 text-[9.5px] font-medium" style={{ background: i % 2 === 0 ? `${blue}12` : `${pink}15`, color: i % 2 === 0 ? blue : "#d4467a" }}>
                  {s.name}
                </span>
              ))}
            </div>
          </Section>

          {data.awards?.length ? (
            <Section id="awards" active={activeSection === "awards"} onClick={sc} className="mt-5">
              <BracketTitle text={labels[l].awards} color={blue} />
              <ul className="ml-3.5 list-disc space-y-1 text-[10.5px]" style={{ color: "#555" }}>
                {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
              </ul>
            </Section>
          ) : null}
        </div>

        {/* Right column */}
        <div className="min-w-0 flex-1">
          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-5">
              <BracketTitle text={labels[l].education} color={blue} />
              {data.education.map((e, i) => (
                <div key={i} className="mb-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[11.5px] font-bold">{e.school}</div>
                    <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{e.period}</div>
                  </div>
                  <div className="text-[10px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                </div>
              ))}
            </Section>
          ) : null}

          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
              <BracketTitle text={labels[l].experience} color={blue} />
              {data.experiences.map((exp, i) => (
                <div key={i} className="mb-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11.5px] font-bold">{exp.title[l]}</div>
                      <div className="text-[10.5px] font-semibold" style={{ color: blue }}>{exp.org[l]}</div>
                    </div>
                    <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                  </div>
                  <FormattedText text={exp.description[l]} className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-5">
              <BracketTitle text={labels[l].projects} color={blue} />
              {data.projects.map((p, i) => (
                <div key={i} className="mb-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[11.5px] font-bold">{p.title[l]}</div>
                    <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{p.date}</div>
                  </div>
                  <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                  {p.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.tags.map((tag, j) => <span key={j} className="rounded-full border px-2 py-px text-[9px]" style={{ borderColor: "#e0e0e0", color: "#888" }}>{tag}</span>)}
                    </div>
                  ) : null}
                </div>
              ))}
            </Section>
          ) : null}

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T02: Hello Gradient - Large photo + HELLO vertical + gradient bg
======================================================================================= */
export function T02_HelloGradient({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const accent = "#2f63ff"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f5f0ff 55%, #fff0f3 100%)", color: "#1a1a2e" }}>
      {/* HELLO vertical decoration */}
      <div className="pointer-events-none absolute right-[42%] top-8 select-none text-[28px] font-black tracking-[0.3em] opacity-[0.12]" style={{ writingMode: "vertical-rl", color: "#ff8aa8" }}>HELLO!</div>

      <div className="flex flex-1 gap-8 px-8 py-8">
        {/* Left: photo + summary + skills */}
        <div className="w-[260px] shrink-0">
          <Section id="basic" active={activeSection === "basic"} onClick={sc}>
            {data.avatar && (
              <div className="mb-4 overflow-hidden rounded-lg shadow-sm">
                <img src={data.avatar} alt="" className="h-[200px] w-full object-cover" crossOrigin="anonymous" />
              </div>
            )}
            <div className="text-[18px] font-black">{data.name[l]}</div>
            <div className="mt-1 text-[11px] font-semibold" style={{ color: accent }}>{data.tagline?.[l] || ""}</div>
          </Section>

          <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mt-4">
            <p className="text-[10.5px] leading-relaxed" style={{ color: "#666" }}>{data.summary?.[l] || ""}</p>
          </Section>

          <Section id="skills" active={activeSection === "skills"} onClick={sc} className="mt-5">
            <div className="mb-2 text-[11px] font-black" style={{ color: accent }}>{labels[l].skills}</div>
            <div className="space-y-2.5">
              {deriveSkillBars(data, 5).map((s, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span style={{ color: "#555" }}>{s.name}</span>
                    <span style={{ color: "#999" }}>{s.value}%</span>
                  </div>
                  <Bar value={s.value} color={accent} bgColor="#e5e7eb" height={5} />
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Right: info + education + experience + projects */}
        <div className="min-w-0 flex-1">
          <Section id="info" active={activeSection === "info"} onClick={sc} className="mb-5">
            <div className="space-y-1.5 text-[10.5px]" style={{ color: "#555" }}>
              {contactItems(data).slice(0, 5).map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />}
                  <span className="break-all">{it.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-5">
              <div className="mb-2.5 text-[11px] font-black" style={{ color: accent }}>{labels[l].education}</div>
              {data.education.map((e, i) => (
                <div key={i} className="mb-2.5">
                  <div className="text-[10.5px] font-bold">{e.school}</div>
                  <div className="text-[10px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                  <div className="text-[9.5px] font-mono" style={{ color: "#999" }}>{e.period}</div>
                </div>
              ))}
            </Section>
          ) : null}

          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
              <div className="mb-2.5 text-[11px] font-black" style={{ color: accent }}>{labels[l].experience}</div>
              {data.experiences.map((exp, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10.5px] font-bold">{exp.title[l]}</div>
                      <div className="text-[10px] font-semibold" style={{ color: accent }}>{exp.org[l]}</div>
                    </div>
                    <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#999" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                  </div>
                  <FormattedText text={exp.description[l]} className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-5">
              <div className="mb-2.5 text-[11px] font-black" style={{ color: accent }}>{labels[l].projects}</div>
              {data.projects.map((p, i) => (
                <div key={i} className="mb-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[10.5px] font-bold">{p.title[l]}</div>
                    <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#999" }}>{p.date}</div>
                  </div>
                  <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </Section>
          ) : null}

          {data.awards?.length ? (
            <Section id="awards" active={activeSection === "awards"} onClick={sc} className="mb-5">
              <div className="mb-2 text-[11px] font-black" style={{ color: accent }}>{labels[l].awards}</div>
              <ul className="ml-3.5 list-disc space-y-1 text-[10.5px]" style={{ color: "#555" }}>
                {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
              </ul>
            </Section>
          ) : null}

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T03: Minimal Blue Photo - RESUME title + blue accent block with photo
======================================================================================= */
export function T03_MinimalBluePhoto({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const blue = "#1f4dff"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "#fff", color: "#111" }}>
      {/* Right accent strip */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1" style={{ background: "#ff7aa2" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full" style={{ background: "#ff7aa2" }} />

      {/* Header area */}
      <div className="flex gap-6 px-8 pt-8">
        <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex-1">
          <div className="text-[13px] font-bold tracking-[0.3em]" style={{ color: "#999" }}>RESUME</div>
          <div className="mt-1.5 text-[22px] font-black">{data.name[l]}</div>
          <div className="mt-1 text-[11px] font-semibold" style={{ color: blue }}>{data.tagline?.[l] || ""}</div>
          <div className="mt-3 space-y-1.5 text-[10.5px]" style={{ color: "#555" }}>
            {contactItems(data).slice(0, 4).map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: "#333" }} />}
                <span className="break-all">{it.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Photo block */}
        {data.avatar && (
          <div className="relative h-[140px] w-[170px] shrink-0">
            <div className="absolute right-0 top-0 h-full w-[130px] rounded-l-lg" style={{ background: blue }} />
            <div className="absolute right-5 top-3 h-[115px] w-[145px] overflow-hidden rounded border-2" style={{ borderColor: "#fff" }}>
              <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
            </div>
          </div>
        )}
      </div>

      {/* Two columns */}
      <div className="flex flex-1 gap-8 px-8 pb-8 pt-5">
        <div className="w-1/2">
          {data.summary?.[l] ? (
            <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-5">
              <div className="mb-2 text-[11px] font-black tracking-[0.15em]" style={{ color: "#333" }}>PROFILE <span className="ml-1.5 text-[10px] font-normal tracking-normal" style={{ color: "#888" }}>{labels[l].profile}</span></div>
              <p className="text-[10.5px] leading-relaxed" style={{ color: "#555" }}>{data.summary[l]}</p>
            </Section>
          ) : null}

          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-5">
              <div className="mb-2 text-[11px] font-black tracking-[0.15em]" style={{ color: "#333" }}>EDUCATION <span className="ml-1.5 text-[10px] font-normal tracking-normal" style={{ color: "#888" }}>{labels[l].education}</span></div>
              {data.education.map((e, i) => (
                <div key={i} className="mb-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[10.5px] font-bold">{e.school}</div>
                    <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{e.period}</div>
                  </div>
                  <div className="text-[10px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                </div>
              ))}
            </Section>
          ) : null}

          <Section id="skills" active={activeSection === "skills"} onClick={sc}>
            <div className="mb-2 text-[11px] font-black tracking-[0.15em]" style={{ color: "#333" }}>SKILLS <span className="ml-1.5 text-[10px] font-normal tracking-normal" style={{ color: "#888" }}>{labels[l].skills}</span></div>
            <div className="space-y-2">
              {deriveSkillBars(data, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-[90px] text-[10px]" style={{ color: "#555" }}>{s.name}</div>
                  <div className="flex flex-1 gap-1">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <span key={j} className="h-2 flex-1 rounded-sm" style={{ background: j < Math.round((s.value / 100) * 6) ? blue : "#cfcfcf" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="w-1/2">
          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
              <div className="mb-2 text-[11px] font-black tracking-[0.15em]" style={{ color: "#333" }}>EXPERIENCE <span className="ml-1.5 text-[10px] font-normal tracking-normal" style={{ color: "#888" }}>{labels[l].experience}</span></div>
              {data.experiences.map((exp, i) => (
                <div key={i} className="mb-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[10.5px] font-bold">{exp.org[l]}</div>
                    <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                  </div>
                  <div className="text-[10px] font-semibold" style={{ color: blue }}>{exp.title[l]}</div>
                  <FormattedText text={exp.description[l]} className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-5">
              <div className="mb-2 text-[11px] font-black tracking-[0.15em]" style={{ color: "#333" }}>PROJECTS <span className="ml-1.5 text-[10px] font-normal tracking-normal" style={{ color: "#888" }}>{labels[l].projects}</span></div>
              {data.projects.map((p, i) => (
                <div key={i} className="mb-2.5">
                  <div className="text-[10.5px] font-bold">{p.title[l]}</div>
                  <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </Section>
          ) : null}

          {data.awards?.length ? (
            <Section id="awards" active={activeSection === "awards"} onClick={sc} className="mb-5">
              <div className="mb-2 text-[11px] font-black tracking-[0.15em]" style={{ color: "#333" }}>AWARDS <span className="ml-1.5 text-[10px] font-normal tracking-normal" style={{ color: "#888" }}>{labels[l].awards}</span></div>
              <ul className="ml-3.5 list-disc space-y-1 text-[10.5px]" style={{ color: "#555" }}>
                {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
              </ul>
            </Section>
          ) : null}

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T04: Purple Wave - Purple wave header + pill section headings
======================================================================================= */
export function T04_PurpleWave({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const purple = "#7b79ff"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "#fff", color: "#111" }}>
      {/* Purple wave header */}
      <div className="relative" style={{ minHeight: 160 }}>
        <div className="absolute inset-x-0 top-0 h-[120px]" style={{ background: purple }} />
        <svg className="absolute inset-x-0 top-[100px]" viewBox="0 0 800 60" preserveAspectRatio="none" style={{ height: 60, width: "100%" }}>
          <path d="M0,0 C200,50 600,10 800,40 L800,0 L0,0 Z" fill={purple} />
        </svg>

        <div className="relative px-8 pt-6">
          <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex items-center justify-between">
            <div>
              <div className="text-[24px] font-black text-white">{data.name[l]}</div>
              <div className="mt-1 text-[11px] font-medium text-white/85">{data.tagline?.[l] || ""}</div>
            </div>
            {data.avatar && (
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: "#fff" }}>
                <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
              </div>
            )}
          </Section>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/80">
            {contactItems(data).slice(0, 4).map((it, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {showIcons && <Icon icon={it.icon} className="h-3 w-3" />}
                <span className="break-all">{it.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 px-8 pb-8 pt-6">
        {data.education?.length ? (
          <Section id="education" active={activeSection === "education"} onClick={sc}>
            <div className="mb-2.5 inline-flex rounded-full px-4 py-1 text-[10.5px] font-bold text-white" style={{ background: purple }}>{labels[l].education}</div>
            <div className="space-y-3">
              {data.education.map((e, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-bold">{e.school}</div>
                    <div className="text-[10px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                  </div>
                  <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{e.period}</div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.experiences?.length ? (
          <Section id="experience" active={activeSection === "experience"} onClick={sc}>
            <div className="mb-2.5 inline-flex rounded-full px-4 py-1 text-[10.5px] font-bold text-white" style={{ background: purple }}>{labels[l].experience}</div>
            <div className="space-y-3.5">
              {data.experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-bold">{exp.org[l]}</div>
                      <div className="text-[10px] font-semibold" style={{ color: purple }}>{exp.title[l]}</div>
                    </div>
                    <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                  </div>
                  <FormattedText text={exp.description[l]} className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.projects?.length ? (
          <Section id="projects" active={activeSection === "projects"} onClick={sc}>
            <div className="mb-2.5 inline-flex rounded-full px-4 py-1 text-[10.5px] font-bold text-white" style={{ background: purple }}>{labels[l].projects}</div>
            <div className="space-y-3">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-[11.5px] font-bold">{p.title[l]}</div>
                    <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{p.date}</div>
                  </div>
                  <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#555" }} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.summary?.[l] ? (
          <Section id="summary" active={activeSection === "summary"} onClick={sc}>
            <div className="mb-2.5 inline-flex rounded-full px-4 py-1 text-[10.5px] font-bold text-white" style={{ background: purple }}>{labels[l].profile}</div>
            <p className="text-[10.5px] leading-relaxed" style={{ color: "#555" }}>{data.summary[l]}</p>
          </Section>
        ) : null}

        {data.skillGroups?.length ? (
          <Section id="skills" active={activeSection === "skills"} onClick={sc}>
            <div className="mb-2.5 inline-flex rounded-full px-4 py-1 text-[10.5px] font-bold text-white" style={{ background: purple }}>{labels[l].skills}</div>
            <div className="flex flex-wrap gap-1.5">
              {data.skillGroups.flatMap((g) => g.items).slice(0, 12).map((s, i) => (
                <span key={i} className="rounded-full border px-2.5 py-0.5 text-[9.5px] font-medium" style={{ borderColor: `${purple}40`, color: purple }}>{s.name}</span>
              ))}
            </div>
          </Section>
        ) : null}

        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />

        {/* Fill remaining space */}
        <div className="flex-1" />
      </div>
    </div>
  )
}

/* =======================================================================================
   T05: Dark Header Table - Dark header bar + table-like experience section
======================================================================================= */
export function T05_DarkHeaderTable({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const dark = "#2d2d2d"

  return (
    <div className="flex min-h-full flex-col" style={{ background: "#f5f5f5", color: "#111" }}>
      {/* Dark header */}
      <div className="px-8 py-6" style={{ background: dark, color: "#fff" }}>
        <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {data.avatar && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: "#fff" }}>
                <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
              </div>
            )}
            <div>
              <div className="text-[20px] font-black">{data.name[l]}</div>
              <div className="text-[10.5px] opacity-80">{data.tagline?.[l] || ""}</div>
            </div>
          </div>
          <div className="space-y-1 text-right text-[10px] opacity-90">
            {contactItems(data).slice(0, 4).map((it, i) => (
              <div key={i} className="flex items-center justify-end gap-1.5">
                {showIcons && <Icon icon={it.icon} className="h-3 w-3" />}
                <span className="break-all">{it.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-8 pb-8 pt-5">
        <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-5">
              <div className="mb-2.5 inline-flex rounded-full px-3.5 py-1 text-[10.5px] font-bold text-white" style={{ background: dark }}>{labels[l].education}</div>
              <div className="space-y-2.5">
                {data.education.map((e, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11.5px] font-bold">{e.school}</div>
                      <div className="text-[10px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                    </div>
                    <div className="shrink-0 text-[10px] font-mono" style={{ color: "#888" }}>{e.period}</div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-5">
              <div className="mb-2.5 inline-flex rounded-full px-3.5 py-1 text-[10.5px] font-bold text-white" style={{ background: dark }}>{labels[l].experience}</div>
              <div className="overflow-hidden rounded-lg border" style={{ borderColor: "#eee" }}>
                {data.experiences.map((exp, i) => (
                  <div key={i} className={`px-4 py-3 ${i !== 0 ? "border-t" : ""}`} style={{ borderColor: "#f0f0f0" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold">{exp.org[l]}</div>
                        <div className="text-[10.5px] font-semibold" style={{ color: dark }}>{exp.title[l]}</div>
                      </div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                    </div>
                    <FormattedText text={exp.description[l]} className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-5">
              <div className="mb-2.5 inline-flex rounded-full px-3.5 py-1 text-[10.5px] font-bold text-white" style={{ background: dark }}>{labels[l].projects}</div>
              <div className="space-y-2.5">
                {data.projects.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-[11px] font-bold">{p.title[l]}</div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{p.date}</div>
                    </div>
                    <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.summary?.[l] ? (
            <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mb-5">
              <div className="mb-2.5 inline-flex rounded-full px-3.5 py-1 text-[10.5px] font-bold text-white" style={{ background: dark }}>{labels[l].summary}</div>
              <p className="text-[10.5px] leading-relaxed" style={{ color: "#666" }}>{data.summary[l]}</p>
            </Section>
          ) : null}

          {data.skillGroups?.length ? (
            <Section id="skills" active={activeSection === "skills"} onClick={sc} className="mb-5">
              <div className="mb-2.5 inline-flex rounded-full px-3.5 py-1 text-[10.5px] font-bold text-white" style={{ background: dark }}>{labels[l].skills}</div>
              <div className="flex flex-wrap gap-1.5">
                {data.skillGroups.flatMap((g) => g.items).slice(0, 12).map((s, i) => (
                  <span key={i} className="rounded-full border px-2.5 py-0.5 text-[9.5px] font-medium" style={{ borderColor: "#ddd", color: "#555" }}>{s.name}</span>
                ))}
              </div>
            </Section>
          ) : null}

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T06: Cute Doodle - Warm card-based layout with cute accents
======================================================================================= */
export function T06_CuteDoodle({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const warm = "#c58b6b"
  const warmAccent = "#ff7a59"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "#fffaf7", color: "#2b2b2b" }}>
      {/* Title */}
      <div className="px-8 pt-8">
        <div className="flex items-center justify-center">
          <div className="rounded-xl border px-5 py-1.5 text-[14px] font-black" style={{ borderColor: warm, color: warm }}>
            {l === "zh" ? "RESUME" : "RESUME"}
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 px-8 pb-8 pt-5">
        {/* Left column */}
        <div className="w-[200px] shrink-0 space-y-4">
          {data.summary?.[l] ? (
            <Section id="summary" active={activeSection === "summary"} onClick={sc}>
              <div className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#f0d4c7" }}>
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black" style={{ color: warm }}>
                  {showIcons && <Icon icon="mdi:account-outline" className="h-3.5 w-3.5" />} {labels[l].profile}
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: "#666" }}>{data.summary[l]}</p>
              </div>
            </Section>
          ) : null}

          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc}>
              <div className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#f0d4c7" }}>
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black" style={{ color: warm }}>
                  {showIcons && <Icon icon="mdi:school-outline" className="h-3.5 w-3.5" />} {labels[l].education}
                </div>
                {data.education.map((e, i) => (
                  <div key={i} className="mb-2 text-[10px]" style={{ color: "#666" }}>
                    <div className="font-bold" style={{ color: "#2b2b2b" }}>{e.school}</div>
                    <div>{deg(e.degree, l)}</div>
                    <div className="text-[9.5px]" style={{ color: "#999" }}>{e.period}</div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <Section id="skills" active={activeSection === "skills"} onClick={sc}>
            <div className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#f0d4c7" }}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black" style={{ color: warm }}>
                {showIcons && <Icon icon="mdi:star-outline" className="h-3.5 w-3.5" />} {labels[l].skills}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(data.skillGroups?.flatMap((g) => g.items) || []).slice(0, 8).map((s, i) => (
                  <span key={i} className="rounded-full border px-2 py-0.5 text-[9px]" style={{ borderColor: "#f0d4c7", color: "#8a6550" }}>{s.name}</span>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Center: avatar + name card */}
        <div className="w-[180px] shrink-0 space-y-4">
          <Section id="basic" active={activeSection === "basic"} onClick={sc}>
            <div className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#f0d4c7" }}>
              <div className="text-[15px] font-black">{data.name[l]}</div>
              <div className="mt-1.5 text-[10px] font-semibold" style={{ color: warmAccent }}>{data.tagline?.[l] || ""}</div>
              <div className="mt-2.5 space-y-1 text-[10px]" style={{ color: "#666" }}>
                {contactItems(data).slice(0, 4).map((it, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {showIcons && <Icon icon={it.icon} className="h-3 w-3 shrink-0" style={{ color: warmAccent }} />}
                    <span className="break-all leading-tight">{it.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="avatar" active={activeSection === "avatar"} onClick={sc}>
            {data.avatar && (
              <div className="overflow-hidden rounded-xl border bg-white p-2" style={{ borderColor: "#f0d4c7" }}>
                <img src={data.avatar} alt="" className="h-[180px] w-full rounded-lg object-cover" crossOrigin="anonymous" />
              </div>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="min-w-0 flex-1 space-y-4">
          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black" style={{ color: warm }}>{labels[l].experience}</div>
              <div className="space-y-3">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#f0d4c7" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10.5px] font-bold" style={{ color: warmAccent }}>{exp.org[l]}</div>
                        <div className="text-[10.5px] font-bold">{exp.title[l]}</div>
                      </div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#999" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                    </div>
                    <FormattedText text={exp.description[l]} className="mt-1.5 text-[10px] leading-relaxed" style={{ color: "#666" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black" style={{ color: warm }}>{labels[l].projects}</div>
              <div className="space-y-2.5">
                {data.projects.map((p, i) => (
                  <div key={i} className="rounded-xl border bg-white p-3.5" style={{ borderColor: "#f0d4c7" }}>
                    <div className="text-[10.5px] font-bold">{p.title[l]}</div>
                    <FormattedText text={p.description[l]} className="mt-1 text-[10px] leading-relaxed" style={{ color: "#666" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>

      {/* Warm bottom gradient */}
      <div className="pointer-events-none h-10 w-full" style={{ background: "linear-gradient(180deg, transparent 0%, #ffe9df 100%)" }} />
    </div>
  )
}

/* =======================================================================================
   T07: Teal/Pink Card - Side color bars + central white card
======================================================================================= */
export function T07_TealPinkCard({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const pink = "#ff6b8a"
  const teal = "#2bb9b2"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "#f0f0f0", color: "#1b1b1b" }}>
      {/* Side color bars */}
      <div className="absolute left-0 top-0 h-full w-4" style={{ background: pink }} />
      <div className="absolute right-0 top-0 h-full w-4" style={{ background: teal }} />

      <div className="relative flex flex-1 flex-col px-8 py-8">
        <div className="flex flex-1 flex-col rounded-2xl bg-white p-7 shadow-sm">
          {/* Name card */}
          <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex gap-6">
            <div className="flex shrink-0 flex-col items-center">
              {data.avatar && (
                <div className="h-20 w-20 overflow-hidden rounded-full border-3" style={{ borderColor: pink, borderWidth: 3 }}>
                  <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                </div>
              )}
              <div className="mt-2 text-center text-[16px] font-black">{data.name[l]}</div>
              <div className="mt-1 text-[10px] font-semibold" style={{ color: pink }}>{data.tagline?.[l] || ""}</div>
            </div>

            <div className="min-w-0 flex-1">
              {data.summary?.[l] ? (
                <div className="rounded-xl bg-[#f7fbfb] p-3.5 text-[10.5px] leading-relaxed" style={{ color: "#555" }}>{data.summary[l]}</div>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-3 text-[10px]" style={{ color: "#666" }}>
                {contactItems(data).slice(0, 6).map((it, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {showIcons && <Icon icon={it.icon} className="h-3 w-3 shrink-0" style={{ color: i % 2 === 0 ? pink : teal }} />}
                    <span className="break-all leading-tight">{it.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Two columns */}
          <div className="mt-6 flex flex-1 gap-8">
            <div className="w-1/2">
              {data.experiences?.length ? (
                <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-6">
                  <div className="mb-2 text-[10.5px] font-black uppercase" style={{ color: "#333" }}>
                    EXPERIENCE <span className="ml-1.5 text-[10px] font-normal normal-case" style={{ color: "#888" }}>{labels[l].experience}</span>
                  </div>
                  <div className="space-y-3">
                    {data.experiences.map((exp, i) => (
                      <div key={i}>
                        <div className="text-[10.5px] font-bold">
                          {exp.org[l]}
                          <span className="ml-2 text-[9.5px] font-mono font-normal" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</span>
                        </div>
                        <div className="text-[10px] font-semibold" style={{ color: pink }}>{exp.title[l]}</div>
                        <FormattedText text={exp.description[l]} className="mt-0.5 text-[10px] leading-relaxed" style={{ color: "#666" }} />
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section id="skills" active={activeSection === "skills"} onClick={sc}>
                <div className="mb-2 text-[10.5px] font-black uppercase" style={{ color: "#333" }}>
                  SKILLS <span className="ml-1.5 text-[10px] font-normal normal-case" style={{ color: "#888" }}>{labels[l].skills}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(data.skillGroups?.flatMap((g) => g.items) || []).slice(0, 10).map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-medium"
                      style={{ background: i % 2 === 0 ? `${pink}15` : `${teal}15`, color: i % 2 === 0 ? pink : teal }}>
                      {showIcons && s.icon && <Icon icon={s.icon} className="h-3 w-3" />}
                      {s.name}
                    </span>
                  ))}
                </div>
              </Section>
            </div>

            <div className="w-1/2">
              {data.education?.length ? (
                <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-6">
                  <div className="mb-2 text-[10.5px] font-black uppercase" style={{ color: "#333" }}>
                    EDUCATION <span className="ml-1.5 text-[10px] font-normal normal-case" style={{ color: "#888" }}>{labels[l].education}</span>
                  </div>
                  <div className="space-y-3">
                    {data.education.map((e, i) => (
                      <div key={i}>
                        <div className="text-[10.5px] font-bold">{e.school}</div>
                        <div className="text-[10px]" style={{ color: teal }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                        <div className="text-[9.5px] font-mono" style={{ color: "#888" }}>{e.period}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              {data.projects?.length ? (
                <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-6">
                  <div className="mb-2 text-[10.5px] font-black uppercase" style={{ color: "#333" }}>
                    PROJECTS <span className="ml-1.5 text-[10px] font-normal normal-case" style={{ color: "#888" }}>{labels[l].projects}</span>
                  </div>
                  <div className="space-y-2.5">
                    {data.projects.map((p, i) => (
                      <div key={i}>
                        <div className="text-[10.5px] font-bold">{p.title[l]}</div>
                        <FormattedText text={p.description[l]} className="mt-0.5 text-[10px] leading-relaxed" style={{ color: "#666" }} />
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              {data.awards?.length ? (
                <Section id="awards" active={activeSection === "awards"} onClick={sc}>
                  <div className="mb-2 text-[10.5px] font-black uppercase" style={{ color: "#333" }}>
                    AWARDS <span className="ml-1.5 text-[10px] font-normal normal-case" style={{ color: "#888" }}>{labels[l].awards}</span>
                  </div>
                  <ul className="ml-3.5 list-disc space-y-1 text-[10px]" style={{ color: "#555" }}>
                    {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
                  </ul>
                </Section>
              ) : null}
            </div>
          </div>

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T08: Red Sidebar - Red left sidebar + right content sections
======================================================================================= */
export function T08_RedSidebar({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const red = "#d8455f"

  return (
    <div className="flex min-h-full" style={{ background: "#fff", color: "#111" }}>
      {/* Left sidebar */}
      <aside className="flex w-[210px] shrink-0 flex-col p-6" style={{ background: red, color: "#fff" }}>
        <Section id="basic" active={activeSection === "basic"} onClick={sc}>
          {data.avatar && (
            <div className="mb-3 h-24 w-24 overflow-hidden border-3 bg-white" style={{ borderColor: "#fff", borderWidth: 3 }}>
              <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
            </div>
          )}
          <div className="text-[20px] font-black">{data.name[l]}</div>
          <div className="mt-1 text-[10.5px] font-medium opacity-90">{data.tagline?.[l] || ""}</div>
        </Section>

        <Section id="info" active={activeSection === "info"} onClick={sc} className="mt-5">
          <div className="space-y-2 text-[10.5px] opacity-95">
            {contactItems(data).slice(0, 5).map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" />}
                <span className="break-all leading-tight">{it.value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="skills" active={activeSection === "skills"} onClick={sc} className="mt-6">
          <div className="text-[11px] font-black">{labels[l].skills}</div>
          <div className="mt-2.5 space-y-2.5">
            {deriveSkillBars(data, 5).map((s, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-[9.5px] opacity-90">
                  <span>{s.name}</span>
                  <span>{s.value}%</span>
                </div>
                <Bar value={s.value} color="#ffffff" bgColor="rgba(255,255,255,0.25)" height={5} />
              </div>
            ))}
          </div>
        </Section>

        {data.summary?.[l] ? (
          <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mt-6">
            <div className="text-[11px] font-black">{labels[l].profile}</div>
            <p className="mt-1.5 text-[10px] leading-relaxed opacity-90">{data.summary[l]}</p>
          </Section>
        ) : null}

        {/* Fill sidebar */}
        <div className="flex-1" />
      </aside>

      {/* Right content */}
      <main className="flex min-w-0 flex-1 flex-col px-8 py-8">
        {data.education?.length ? (
          <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-7">
            <div className="text-[12px] font-black" style={{ color: red }}>
              {labels[l].education} <span className="ml-1.5 text-[11px] font-bold uppercase">EDUCATION</span>
            </div>
            <div className="mt-3 space-y-4">
              {data.education.map((e, i) => (
                <div key={i}>
                  <div className="inline-flex rounded-full px-3 py-0.5 text-[9.5px] font-bold text-white" style={{ background: red }}>{e.period}</div>
                  <div className="mt-1.5 text-[11.5px] font-bold">{e.school}</div>
                  <div className="text-[10.5px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.experiences?.length ? (
          <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-7">
            <div className="text-[12px] font-black" style={{ color: red }}>
              {labels[l].experience} <span className="ml-1.5 text-[11px] font-bold uppercase">EXPERIENCE</span>
            </div>
            <div className="mt-3 space-y-5">
              {data.experiences.map((exp, i) => (
                <div key={i}>
                  <div className="inline-flex rounded-full px-3 py-0.5 text-[9.5px] font-bold text-white" style={{ background: red }}>
                    {exp.startDate} - {exp.endDate || labels[l].present}
                  </div>
                  <div className="mt-1.5 text-[11.5px] font-bold">{exp.org[l]}</div>
                  <div className="text-[10.5px] font-semibold" style={{ color: red }}>{exp.title[l]}</div>
                  <FormattedText text={exp.description[l]} className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.projects?.length ? (
          <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-7">
            <div className="text-[12px] font-black" style={{ color: red }}>
              {labels[l].projects} <span className="ml-1.5 text-[11px] font-bold uppercase">PROJECTS</span>
            </div>
            <div className="mt-3 space-y-3">
              {data.projects.map((p, i) => (
                <div key={i}>
                  <div className="text-[11px] font-bold">{p.title[l]}</div>
                  <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.awards?.length ? (
          <Section id="awards" active={activeSection === "awards"} onClick={sc} className="mb-7">
            <div className="text-[12px] font-black" style={{ color: red }}>
              {labels[l].awards} <span className="ml-1.5 text-[11px] font-bold uppercase">AWARDS</span>
            </div>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-[10.5px]" style={{ color: "#555" }}>
              {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
            </ul>
          </Section>
        ) : null}

        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />

        <div className="flex-1" />
      </main>
    </div>
  )
}

/* =======================================================================================
   T09: Bunny Grass - Cream bg + orange headings + grass decoration
======================================================================================= */
export function T09_BunnyGrass({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const orange = "#ff7a59"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{ background: "#f7f2ec", color: "#222" }}>
      {/* Header */}
      <div className="px-8 pt-8">
        <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex items-start gap-6">
          {data.avatar && (
            <div className="shrink-0 rounded-xl bg-white p-2 shadow-sm">
              <img src={data.avatar} alt="" className="h-[120px] w-[110px] rounded-lg object-cover" crossOrigin="anonymous" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[20px] font-black">{data.name[l]}</div>
            <div className="mt-1 text-[11px] font-semibold" style={{ color: orange }}>{data.tagline?.[l] || ""}</div>
            {data.summary?.[l] ? (
              <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: "#666" }}>{data.summary[l]}</p>
            ) : null}
          </div>
          <div className="shrink-0 space-y-1.5 text-right text-[10px]" style={{ color: "#555" }}>
            {contactItems(data).slice(0, 4).map((it, i) => (
              <div key={i} className="flex items-center justify-end gap-1.5">
                {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: orange }} />}
                <span className="break-all">{it.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* 3-column grid */}
      <div className="flex-1 px-8 pt-6">
        <div className="grid grid-cols-3 gap-6">
          {data.skillGroups?.length ? (
            <Section id="skills" active={activeSection === "skills"} onClick={sc}>
              <div className="mb-2 text-[11px] font-black" style={{ color: orange }}>
                Skills <span className="ml-1.5 text-[10px] font-normal" style={{ color: "#888" }}>{labels[l].skills}</span>
              </div>
              <div className="space-y-2">
                {deriveSkillBars(data, 4).map((s, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-[9.5px]" style={{ color: "#666" }}>
                      <span>{s.name}</span><span>{s.value}%</span>
                    </div>
                    <Bar value={s.value} color={orange} bgColor="#ddd" height={5} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc}>
              <div className="mb-2 text-[11px] font-black" style={{ color: orange }}>
                Education <span className="ml-1.5 text-[10px] font-normal" style={{ color: "#888" }}>{labels[l].education}</span>
              </div>
              <div className="space-y-2.5 text-[10.5px]" style={{ color: "#666" }}>
                {data.education.map((e, i) => (
                  <div key={i}>
                    <div className="font-bold" style={{ color: "#222" }}>{e.school}</div>
                    <div className="text-[10px]">{deg(e.degree, l)}</div>
                    <div className="text-[9.5px]" style={{ color: "#999" }}>{e.period}</div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.awards?.length ? (
            <Section id="awards" active={activeSection === "awards"} onClick={sc}>
              <div className="mb-2 text-[11px] font-black" style={{ color: orange }}>
                Awards <span className="ml-1.5 text-[10px] font-normal" style={{ color: "#888" }}>{labels[l].awards}</span>
              </div>
              <ul className="ml-3.5 list-disc space-y-1 text-[10.5px]" style={{ color: "#666" }}>
                {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
              </ul>
            </Section>
          ) : null}
        </div>

        {/* Experience */}
        {data.experiences?.length ? (
          <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mt-6">
            <div className="mb-2 text-[11px] font-black" style={{ color: orange }}>
              Experience <span className="ml-1.5 text-[10px] font-normal" style={{ color: "#888" }}>{labels[l].experience}</span>
            </div>
            <div className="space-y-3">
              {data.experiences.map((exp, i) => (
                <div key={i} className="rounded-xl bg-white p-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10.5px] font-bold" style={{ color: orange }}>{exp.org[l]}</div>
                      <div className="text-[10.5px] font-bold">{exp.title[l]}</div>
                    </div>
                    <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                  </div>
                  <FormattedText text={exp.description[l]} className="mt-1.5 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {data.projects?.length ? (
          <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mt-5">
            <div className="mb-2 text-[11px] font-black" style={{ color: orange }}>
              Projects <span className="ml-1.5 text-[10px] font-normal" style={{ color: "#888" }}>{labels[l].projects}</span>
            </div>
            <div className="space-y-2.5">
              {data.projects.map((p, i) => (
                <div key={i} className="rounded-xl bg-white p-3 shadow-sm">
                  <div className="text-[10.5px] font-bold">{p.title[l]}</div>
                  <FormattedText text={p.description[l]} className="mt-0.5 text-[10px] leading-relaxed" style={{ color: "#666" }} />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
      </div>

      {/* Bottom grass decoration */}
      <div className="pointer-events-none mt-auto h-14 w-full" style={{ background: "linear-gradient(180deg, transparent 0%, #bfe6b8 100%)" }} />
      <div className="pointer-events-none absolute bottom-3 right-8">
        {showIcons && <Icon icon="mdi:rabbit" className="h-10 w-10" style={{ color: orange, opacity: 0.6 }} />}
      </div>
    </div>
  )
}

/* =======================================================================================
   T10: Brown/Pink Cards - Brown header card + pink card sections
======================================================================================= */
export function T10_BrownPinkCards({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const brown = "#8c5a43"
  const pinkBg = "#f1bcbc"

  return (
    <div className="flex min-h-full flex-col" style={{ background: "#f7d6d6", color: "#2b2b2b" }}>
      <div className="flex flex-1 flex-col px-8 py-8">
        {/* Brown header card */}
        <Section id="basic" active={activeSection === "basic"} onClick={sc} className="rounded-2xl p-5 text-white" style={{ background: brown }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {data.avatar && (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: "#fff" }}>
                  <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                </div>
              )}
              <div>
                <div className="text-[16px] font-black">{data.nickname || data.name[l]}</div>
                <div className="mt-0.5 text-[10px] opacity-90">{data.tagline?.[l] || ""}</div>
              </div>
            </div>
            <div className="space-y-1 text-right text-[9.5px] opacity-95">
              {contactItems(data).slice(0, 3).map((it, i) => (
                <div key={i} className="flex items-center justify-end gap-1.5">
                  {showIcons && <Icon icon={it.icon} className="h-3 w-3 shrink-0" />}
                  <span className="break-all">{it.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <div className="mt-6 flex flex-1 gap-6">
          {/* Left column */}
          <div className="w-[200px] shrink-0 space-y-4">
            <Section id="skills" active={activeSection === "skills"} onClick={sc} className="rounded-2xl p-4" style={{ background: pinkBg }}>
              <div className="mb-3 inline-flex rounded-full bg-white px-3 py-0.5 text-[11px] font-black" style={{ color: brown }}>{labels[l].skills}</div>
              <div className="space-y-2.5">
                {deriveSkillBars(data, 4).map((s, i) => (
                  <div key={i}>
                    <div className="mb-1 text-[9.5px] font-bold" style={{ color: "#6b3f2f" }}>{s.name}</div>
                    <div className="h-1.5 rounded-full bg-white/60"><div className="h-1.5 rounded-full" style={{ width: `${s.value}%`, background: brown }} /></div>
                  </div>
                ))}
              </div>
            </Section>

            {data.awards?.length ? (
              <Section id="awards" active={activeSection === "awards"} onClick={sc} className="rounded-2xl p-4" style={{ background: pinkBg }}>
                <div className="mb-2 inline-flex rounded-full bg-white px-3 py-0.5 text-[11px] font-black" style={{ color: brown }}>{labels[l].awards}</div>
                <ul className="ml-3.5 list-disc space-y-1 text-[10px]" style={{ color: "#6b3f2f" }}>
                  {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
                </ul>
              </Section>
            ) : null}
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-1 space-y-4">
            {data.summary?.[l] ? (
              <Section id="summary" active={activeSection === "summary"} onClick={sc} className="rounded-2xl p-4" style={{ background: pinkBg }}>
                <div className="mb-2 inline-flex rounded-full bg-white px-3 py-0.5 text-[11px] font-black" style={{ color: brown }}>{labels[l].profile}</div>
                <p className="text-[10.5px] leading-relaxed" style={{ color: "#6b3f2f" }}>{data.summary[l]}</p>
              </Section>
            ) : null}

            {data.education?.length ? (
              <Section id="education" active={activeSection === "education"} onClick={sc} className="rounded-2xl p-4" style={{ background: pinkBg }}>
                <div className="mb-2 inline-flex rounded-full bg-white px-3 py-0.5 text-[11px] font-black" style={{ color: brown }}>{labels[l].education}</div>
                <div className="space-y-2.5 text-[10.5px]" style={{ color: "#6b3f2f" }}>
                  {data.education.map((e, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold" style={{ color: brown }}>{e.school}</div>
                        <div className="text-[10px]">{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                      </div>
                      <div className="shrink-0 text-[9.5px] font-mono">{e.period}</div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {data.experiences?.length ? (
              <Section id="experience" active={activeSection === "experience"} onClick={sc} className="rounded-2xl p-4" style={{ background: pinkBg }}>
                <div className="mb-2 inline-flex rounded-full bg-white px-3 py-0.5 text-[11px] font-black" style={{ color: brown }}>{labels[l].experience}</div>
                <div className="space-y-3">
                  {data.experiences.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-bold" style={{ color: brown }}>{exp.org[l]}</div>
                        <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#6b3f2f" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                      </div>
                      <div className="text-[10.5px] font-semibold" style={{ color: "#6b3f2f" }}>{exp.title[l]}</div>
                      <FormattedText text={exp.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#6b3f2f" }} />
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T11: Grid Chibi - Grid paper bg + blue/orange sections
======================================================================================= */
export function T11_GridChibi({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const blue = "#3b82f6"
  const orange = "#ff8a00"

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden" style={{
      background: "linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(0,0,0,0.04) 1px, transparent 1px), #ffffff",
      backgroundSize: "22px 22px",
      color: "#1f2937",
    }}>
      <div className="flex flex-1 gap-8 px-8 py-8">
        {/* Left sidebar */}
        <div className="w-[220px] shrink-0">
          <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex items-center gap-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-full" style={{ background: "#ffe0c8" }} />
              <div className="absolute left-1.5 top-1.5 h-17 w-17 overflow-hidden rounded-full border-3" style={{ borderColor: "#fff", borderWidth: 3, width: 68, height: 68 }}>
                {data.avatar ? <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" /> : null}
              </div>
            </div>
            <div>
              <div className="text-[18px] font-black" style={{ color: orange }}>{data.name[l]}</div>
              <div className="text-[10px] font-semibold" style={{ color: "#6b7280" }}>{data.tagline?.[l] || ""}</div>
            </div>
          </Section>

          <Section id="info" active={activeSection === "info"} onClick={sc} className="mt-5">
            <div className="text-[11px] font-black" style={{ color: blue }}>{labels[l].contact}</div>
            <div className="mt-2.5 space-y-2 text-[10.5px]" style={{ color: "#6b7280" }}>
              {contactItems(data).slice(0, 5).map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: blue }} />}
                  <span className="break-all leading-tight">{it.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {data.summary?.[l] ? (
            <Section id="summary" active={activeSection === "summary"} onClick={sc} className="mt-6">
              <div className="text-[11px] font-black" style={{ color: orange }}>{labels[l].profile}</div>
              <p className="mt-1.5 text-[10px] leading-relaxed" style={{ color: "#6b7280" }}>{data.summary[l]}</p>
            </Section>
          ) : null}

          {data.awards?.length ? (
            <Section id="awards" active={activeSection === "awards"} onClick={sc} className="mt-6">
              <div className="text-[11px] font-black" style={{ color: blue }}>{labels[l].awards}</div>
              <ul className="mt-1.5 ml-3.5 list-disc space-y-1 text-[10px]" style={{ color: "#6b7280" }}>
                {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
              </ul>
            </Section>
          ) : null}
        </div>

        {/* Right main content */}
        <div className="min-w-0 flex-1">
          {data.skillGroups?.length ? (
            <Section id="skills" active={activeSection === "skills"} onClick={sc} className="mb-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: orange }} />
                <div className="text-[13px] font-black" style={{ color: blue }}>{labels[l].skills}</div>
                <div className="h-[2px] flex-1" style={{ background: "#c7ddff" }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.skillGroups.flatMap((g) => g.items).slice(0, 12).map((s, i) => (
                  <span key={i} className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold" style={{ background: i % 2 === 0 ? `${blue}12` : `${orange}15`, color: i % 2 === 0 ? blue : orange }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc} className="mb-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: orange }} />
                <div className="text-[13px] font-black" style={{ color: blue }}>{labels[l].education}</div>
                <div className="h-[2px] flex-1" style={{ background: "#c7ddff" }} />
              </div>
              <div className="mt-3 space-y-3">
                {data.education.map((e, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-[11.5px] font-bold">{e.school}</div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#6b7280" }}>{e.period}</div>
                    </div>
                    <div className="text-[10.5px]" style={{ color: "#6b7280" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc} className="mb-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: orange }} />
                <div className="text-[13px] font-black" style={{ color: blue }}>{labels[l].experience}</div>
                <div className="h-[2px] flex-1" style={{ background: "#c7ddff" }} />
              </div>
              <div className="mt-3 space-y-4">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="rounded-xl bg-white p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-bold" style={{ color: orange }}>{exp.org[l]}</div>
                        <div className="text-[10.5px] font-bold">{exp.title[l]}</div>
                      </div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#6b7280" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                    </div>
                    <FormattedText text={exp.description[l]} className="mt-1.5 text-[10.5px] leading-relaxed" style={{ color: "#6b7280" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc} className="mb-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: orange }} />
                <div className="text-[13px] font-black" style={{ color: blue }}>{labels[l].projects}</div>
                <div className="h-[2px] flex-1" style={{ background: "#c7ddff" }} />
              </div>
              <div className="mt-3 space-y-2.5">
                {data.projects.map((p, i) => (
                  <div key={i}>
                    <div className="text-[11px] font-bold">{p.title[l]}</div>
                    <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#6b7280" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
        </div>
      </div>
    </div>
  )
}

/* =======================================================================================
   T12: Yellow Table - Structured table resume with yellow accents
======================================================================================= */
export function T12_YellowTable({ data, palette, locale, showIcons, activeSection, onSectionClick }: LayoutProps) {
  const l = locale
  const sc = onSectionClick
  const yellow = "#f2d06b"
  const yellowDark = "#b98100"

  return (
    <div className="flex min-h-full flex-col" style={{ background: "#fff7cf", color: "#111" }}>
      <div className="flex flex-1 flex-col px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <Section id="basic" active={activeSection === "basic"} onClick={sc} className="flex items-center gap-4">
            {data.avatar && (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2" style={{ borderColor: yellow }}>
                <img src={data.avatar} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
              </div>
            )}
            <div>
              <div className="text-[18px] font-black">{data.name[l]}</div>
              <div className="mt-0.5 text-[11px] font-semibold" style={{ color: yellowDark }}>{data.tagline?.[l] || ""}</div>
            </div>
          </Section>

          <Section id="info" active={activeSection === "info"} onClick={sc} className="text-right text-[10.5px]" style={{ color: "#555" }}>
            {contactItems(data).slice(0, 4).map((it, i) => (
              <div key={i} className="flex items-center justify-end gap-1.5">
                {showIcons && <Icon icon={it.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: yellowDark }} />}
                <span className="break-all">{it.value}</span>
              </div>
            ))}
          </Section>
        </div>

        {/* Table body */}
        <div className="mt-5 flex-1 overflow-hidden rounded-xl border" style={{ borderColor: "#e6d18b" }}>
          {data.summary?.[l] ? (
            <Section id="summary" active={activeSection === "summary"} onClick={sc}>
              <div className="px-4 py-2 text-[11px] font-black" style={{ background: yellow }}>{labels[l].profile}</div>
              <div className="bg-white px-4 py-3 text-[10.5px] leading-relaxed" style={{ color: "#555" }}>{data.summary[l]}</div>
            </Section>
          ) : null}

          {data.education?.length ? (
            <Section id="education" active={activeSection === "education"} onClick={sc}>
              <div className="px-4 py-2 text-[11px] font-black" style={{ background: yellow }}>{labels[l].education}</div>
              <div className="bg-white px-4 py-3 text-[10.5px]" style={{ color: "#444" }}>
                {data.education.map((e, i) => (
                  <div key={i} className="mb-2.5 last:mb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-bold">{e.school}</div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{e.period}</div>
                    </div>
                    <div className="text-[10px]" style={{ color: "#666" }}>{deg(e.degree, l)}{deg(e.detail, l) ? ` - ${deg(e.detail, l)}` : ""}</div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.experiences?.length ? (
            <Section id="experience" active={activeSection === "experience"} onClick={sc}>
              <div className="px-4 py-2 text-[11px] font-black" style={{ background: yellow }}>{labels[l].experience}</div>
              <div className="bg-white px-4 py-3 text-[10.5px]" style={{ color: "#444" }}>
                {data.experiences.map((exp, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-bold">{exp.org[l]}</div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{exp.startDate} - {exp.endDate || labels[l].present}</div>
                    </div>
                    <div className="font-semibold" style={{ color: yellowDark }}>{exp.title[l]}</div>
                    <FormattedText text={exp.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.projects?.length ? (
            <Section id="projects" active={activeSection === "projects"} onClick={sc}>
              <div className="px-4 py-2 text-[11px] font-black" style={{ background: yellow }}>{labels[l].projects}</div>
              <div className="bg-white px-4 py-3 text-[10.5px]" style={{ color: "#444" }}>
                {data.projects.map((p, i) => (
                  <div key={i} className="mb-2.5 last:mb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-bold">{p.title[l]}</div>
                      <div className="shrink-0 text-[9.5px] font-mono" style={{ color: "#888" }}>{p.date}</div>
                    </div>
                    <FormattedText text={p.description[l]} className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: "#666" }} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.skillGroups?.length ? (
            <Section id="skills" active={activeSection === "skills"} onClick={sc}>
              <div className="px-4 py-2 text-[11px] font-black" style={{ background: yellow }}>{labels[l].skills}</div>
              <div className="bg-white px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {data.skillGroups.flatMap((g) => g.items).slice(0, 12).map((s, i) => (
                    <span key={i} className="rounded-full border px-2.5 py-0.5 text-[9.5px] font-medium" style={{ borderColor: "#e6d18b", color: yellowDark }}>{s.name}</span>
                  ))}
                </div>
              </div>
            </Section>
          ) : null}

          {data.awards?.length ? (
            <Section id="awards" active={activeSection === "awards"} onClick={sc}>
              <div className="px-4 py-2 text-[11px] font-black" style={{ background: yellow }}>{labels[l].awards}</div>
              <div className="bg-white px-4 py-3">
                <ul className="ml-3.5 list-disc space-y-1 text-[10.5px]" style={{ color: "#555" }}>
                  {data.awards.map((a, i) => <li key={i}>{a[l] || a.zh || a.en}</li>)}
                </ul>
              </div>
            </Section>
          ) : null}
        </div>

        <CustomSections sections={data.customSections} palette={palette} locale={l} showIcons={showIcons} activeSection={activeSection} onSectionClick={sc} />
      </div>
    </div>
  )
}
