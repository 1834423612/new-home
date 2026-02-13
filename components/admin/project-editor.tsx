"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { InputField, TextAreaField, AdminButton, SelectField } from "./form-fields"
import { RichTextEditor } from "./rich-text-editor"
import { LinksManager } from "./links-manager"
import { TagInput } from "./tag-input"
import Link from "next/link"

interface ProjectLink {
  id?: string
  title_zh: string
  title_en: string
  url: string
  icon?: string
}

interface ProjectFormData {
  id: string
  slug: string
  title_zh: string
  title_en: string
  description_zh: string
  description_en: string
  detail_zh: string
  detail_en: string
  category: string
  tags: string[]
  image: string
  link: string
  source: string
  date: string
  featured: boolean
  sort_order: number
  links: ProjectLink[]
}

const defaultForm: ProjectFormData = {
  id: "", slug: "", title_zh: "", title_en: "",
  description_zh: "", description_en: "", detail_zh: "", detail_en: "",
  category: "website", tags: [], image: "", link: "", source: "",
  date: "", featured: false, sort_order: 0, links: [],
}

const categoryOptions = [
  { value: "website", label: "Website" },
  { value: "tool", label: "Tool" },
  { value: "game", label: "Game" },
  { value: "design", label: "Design" },
  { value: "contribution", label: "Contribution" },
]

export function ProjectEditor({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const isNew = !projectId || projectId === "new"
  const [form, setForm] = useState<ProjectFormData>(defaultForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("basic")

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const parseLinks = (t: string | undefined | null): ProjectLink[] => {
    if (!t) return []
    try { const p = JSON.parse(t); return Array.isArray(p) ? p : [] } catch { return [] }
  }

  const parseTags = (t: string | string[] | undefined | null): string[] => {
    if (!t) return []
    if (Array.isArray(t)) return t
    try { return JSON.parse(t) } catch { return [] }
  }

  const fetchProject = useCallback(async () => {
    if (isNew) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/projects")
      if (res.ok) {
        const projects = await res.json()
        const p = projects.find((pr: { id: string }) => pr.id === projectId)
        if (p) {
          setForm({
            id: p.id,
            slug: p.slug || p.id,
            title_zh: p.title_zh || "",
            title_en: p.title_en || "",
            description_zh: p.description_zh || "",
            description_en: p.description_en || "",
            detail_zh: p.detail_zh || "",
            detail_en: p.detail_en || "",
            category: p.category || "website",
            tags: parseTags(p.tags),
            image: p.image || "",
            link: p.link || "",
            source: p.source || "",
            date: p.date || "",
            featured: p.featured ? true : false,
            sort_order: p.sort_order || 0,
            links: parseLinks(p.links_json),
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }, [isNew, projectId])

  useEffect(() => { fetchProject() }, [fetchProject])

  const handleSave = async () => {
    if (!form.id || !form.title_zh || !form.title_en) {
      alert("Please fill in ID, Title (zh), and Title (en)")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags,
          links_json: JSON.stringify(form.links),
        }),
      })
      if (res.ok) {
        router.push("/admin/projects")
      } else {
        alert("Failed to save project")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading project...
      </div>
    )
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: "mdi:information-outline" },
    { id: "content", label: "Content", icon: "mdi:text-box-outline" },
    { id: "detail", label: "Detail (Rich Text)", icon: "mdi:file-document-edit-outline" },
    { id: "links", label: "Links & Tags", icon: "mdi:link-variant" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isNew ? "New Project" : "Edit Project"}
            </h2>
            {!isNew && (
              <p className="text-[10px] font-mono text-muted-foreground">ID: {projectId}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="secondary" onClick={() => router.push("/admin/projects")}>
            Cancel
          </AdminButton>
          <AdminButton onClick={handleSave} disabled={saving}>
            <Icon icon={saving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Saving..." : "Save"}
          </AdminButton>
        </div>
      </div>

      {/* Section nav */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <Icon icon={s.icon} className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeSection === "basic" && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Icon icon="mdi:information-outline" className="h-4 w-4 text-primary" />
            Basic Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="ID (unique identifier)" value={form.id} onChange={(v) => set("id", v)} required disabled={!isNew} placeholder="e.g. my-project" />
            <InputField label="URL Slug" value={form.slug} onChange={(v) => set("slug", v)} required placeholder="e.g. my-project" />
            <InputField label="Title (zh)" value={form.title_zh} onChange={(v) => set("title_zh", v)} required placeholder="Chinese title" />
            <InputField label="Title (en)" value={form.title_en} onChange={(v) => set("title_en", v)} required placeholder="English title" />
            <SelectField label="Category" value={form.category} onChange={(v) => set("category", v)} options={categoryOptions} />
            <InputField label="Date" value={form.date} onChange={(v) => set("date", v)} placeholder="e.g. 2024.1 - 2024.6" />
            <InputField label="Image URL" value={form.image} onChange={(v) => set("image", v)} placeholder="https://..." />
            <InputField label="Sort Order" value={String(form.sort_order)} onChange={(v) => set("sort_order", parseInt(v) || 0)} type="number" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="relative flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/30">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="peer sr-only"
              />
              <div className="flex h-5 w-9 items-center rounded-full bg-secondary p-0.5 transition-colors peer-checked:bg-primary">
                <div className="h-4 w-4 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">Featured Project</span>
                <p className="text-[10px] text-muted-foreground">Show in highlighted section on homepage</p>
              </div>
            </label>
          </div>
          {form.image && (
            <div className="mt-2">
              <label className="mb-1.5 block text-xs font-mono text-muted-foreground">Image Preview</label>
              <div className="h-32 w-48 overflow-hidden rounded-lg border border-border">
                <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {activeSection === "content" && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Icon icon="mdi:text-box-outline" className="h-4 w-4 text-primary" />
            Description
          </h3>
          <TextAreaField label="Description (zh)" value={form.description_zh} onChange={(v) => set("description_zh", v)} rows={4} />
          <TextAreaField label="Description (en)" value={form.description_en} onChange={(v) => set("description_en", v)} rows={4} />
        </div>
      )}

      {/* Detail Rich Text */}
      {activeSection === "detail" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Icon icon="mdi:file-document-edit-outline" className="h-4 w-4 text-primary" />
                  Detailed Content (Rich Text)
                </h3>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Write article-style content with formatting, images, video, and audio. Displayed on the project detail page.
                </p>
              </div>
              {form.detail_zh && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Copy Chinese content to English editor? This will overwrite the current English content.\n\nMedia embeds (images, videos, audio) will be kept -- you only need to translate the text.")) {
                      set("detail_en", form.detail_zh)
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon icon="mdi:content-copy" className="h-3.5 w-3.5" />
                  Copy zh to en
                </button>
              )}
            </div>
            <div className="space-y-6">
              <RichTextEditor label="Detail Content (zh)" value={form.detail_zh} onChange={(v) => set("detail_zh", v)} />
              <RichTextEditor label="Detail Content (en)" value={form.detail_en} onChange={(v) => set("detail_en", v)} />
            </div>
          </div>
        </div>
      )}

      {/* Links & Tags */}
      {activeSection === "links" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Icon icon="mdi:link-variant" className="h-4 w-4 text-primary" />
              Project URLs
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Live Project URL" value={form.link} onChange={(v) => set("link", v)} placeholder="https://..." />
              <InputField label="Source Code URL" value={form.source} onChange={(v) => set("source", v)} placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Icon icon="mdi:tag-multiple-outline" className="h-4 w-4 text-primary" />
              Tags
            </h3>
            <TagInput
              tags={form.tags}
              onChange={(tags) => set("tags", tags)}
              placeholder="Type a tag and press Enter..."
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <LinksManager value={form.links} onChange={(links) => set("links", links)} />
          </div>
        </div>
      )}
    </div>
  )
}
