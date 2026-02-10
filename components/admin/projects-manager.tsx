"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, TextAreaField, AdminButton } from "./form-fields"

interface ProjectRow {
  id: string; title_zh: string; title_en: string; description_zh: string; description_en: string
  detail_zh?: string; detail_en?: string; slug?: string
  category: string; tags: string | string[]; image: string | null; link: string | null
  source: string | null; date: string; featured: boolean | number; sort_order: number
}

export function ProjectsManager() {
  const [items, setItems] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ProjectRow | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/projects"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return
    await fetch("/api/admin/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchItems()
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Projects ({items.length})</h2>
        <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}><Icon icon="mdi:plus" className="h-4 w-4" /> Add Project</AdminButton>
      </div>
      {showForm && <ProjectForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{item.title_zh}</h3>
                {(item.featured === 1 || item.featured === true) && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">featured</span>}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{item.category} / {item.date} / slug: {item.slug || item.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditing(item); setShowForm(true) }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Icon icon="mdi:pencil-outline" className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"><Icon icon="mdi:delete-outline" className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectForm({ initial, onSave, onCancel }: { initial: ProjectRow | null; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const parseTags = (t: string | string[] | undefined | null): string => {
    if (!t) return ""; if (Array.isArray(t)) return t.join(", ")
    try { return JSON.parse(t).join(", ") } catch { return String(t) }
  }
  const [form, setForm] = useState({
    id: initial?.id || "", slug: initial?.slug || initial?.id || "",
    title_zh: initial?.title_zh || "", title_en: initial?.title_en || "",
    description_zh: initial?.description_zh || "", description_en: initial?.description_en || "",
    detail_zh: initial?.detail_zh || "", detail_en: initial?.detail_en || "",
    category: initial?.category || "website", tags: parseTags(initial?.tags),
    image: initial?.image || "", link: initial?.link || "", source: initial?.source || "",
    date: initial?.date || "", featured: initial?.featured ? true : false, sort_order: initial?.sort_order || 0,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }) }} className="mb-6 rounded-xl border border-primary/30 bg-card p-6">
      <h3 className="mb-4 text-sm font-bold text-foreground">{initial ? "Edit Project" : "New Project"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="ID (unique)" value={form.id} onChange={(v) => set("id", v)} required disabled={!!initial} />
        <InputField label="URL Slug" value={form.slug} onChange={(v) => set("slug", v)} required />
        <InputField label="Category" value={form.category} onChange={(v) => set("category", v)} />
        <InputField label="Date" value={form.date} onChange={(v) => set("date", v)} />
        <InputField label="Title (zh)" value={form.title_zh} onChange={(v) => set("title_zh", v)} required />
        <InputField label="Title (en)" value={form.title_en} onChange={(v) => set("title_en", v)} required />
        <TextAreaField label="Description (zh)" value={form.description_zh} onChange={(v) => set("description_zh", v)} />
        <TextAreaField label="Description (en)" value={form.description_en} onChange={(v) => set("description_en", v)} />
        <TextAreaField label="Detail (zh)" value={form.detail_zh} onChange={(v) => set("detail_zh", v)} />
        <TextAreaField label="Detail (en)" value={form.detail_en} onChange={(v) => set("detail_en", v)} />
        <InputField label="Tags (comma separated)" value={form.tags} onChange={(v) => set("tags", v)} />
        <InputField label="Image URL" value={form.image} onChange={(v) => set("image", v)} />
        <InputField label="Project Link" value={form.link} onChange={(v) => set("link", v)} />
        <InputField label="Source Code URL" value={form.source} onChange={(v) => set("source", v)} />
        <InputField label="Sort Order" value={String(form.sort_order)} onChange={(v) => set("sort_order", parseInt(v) || 0)} type="number" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-primary" />
          Featured
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <AdminButton type="submit">Save</AdminButton>
        <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
      </div>
    </form>
  )
}
