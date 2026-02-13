"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, TextAreaField, SelectField, AdminButton, IconPreview } from "./form-fields"

interface SiteToolRow {
  id: string; title_zh: string; title_en: string; description_zh: string
  description_en: string; url: string; icon: string | null; tags: string | string[]
  type: string; since: string | null; sort_order: number; table: "site" | "tool"
}

export function SitesToolsManager() {
  const [items, setItems] = useState<SiteToolRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<SiteToolRow | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/sites"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
  }
  const handleDelete = async (id: string, type: string) => {
    if (!confirm("Delete?")) return
    await fetch("/api/admin/sites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, type }) })
    fetchItems()
  }

  const parseTags = (t: string | string[] | null | undefined): string => {
    if (!t) return ""; if (Array.isArray(t)) return t.join(", ")
    try { return JSON.parse(t).join(", ") } catch { return String(t) }
  }

  const personalSites = items.filter((i) => i.table === "site")
  const toolItems = items.filter((i) => i.table === "tool")

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Sites & Tools ({items.length})</h2>
        <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}><Icon icon="mdi:plus" className="h-4 w-4" /> Add</AdminButton>
      </div>
      {showForm && <SiteToolForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}

      {personalSites.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">Personal Sites</h3>
          <div className="flex flex-col gap-3">
            {personalSites.map((item) => (
              <SiteRow key={item.id} item={item} parseTags={parseTags} onEdit={() => { setEditing(item); setShowForm(true) }} onDelete={() => handleDelete(item.id, "site")} />
            ))}
          </div>
        </div>
      )}
      {toolItems.length > 0 && (
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">Tools</h3>
          <div className="flex flex-col gap-3">
            {toolItems.map((item) => (
              <SiteRow key={item.id} item={item} parseTags={parseTags} onEdit={() => { setEditing(item); setShowForm(true) }} onDelete={() => handleDelete(item.id, "tool")} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SiteRow({ item, parseTags, onEdit, onDelete }: { item: SiteToolRow; parseTags: (t: string | string[] | null | undefined) => string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {item.icon && <Icon icon={item.icon} className="h-5 w-5 shrink-0 text-muted-foreground" />}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">{item.title_zh}</h3>
          <p className="font-mono text-[10px] text-muted-foreground truncate">{item.url} / tags: {parseTags(item.tags)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-mono text-secondary-foreground">{item.table}</span>
        <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Icon icon="mdi:pencil-outline" className="h-4 w-4" /></button>
        <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"><Icon icon="mdi:delete-outline" className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

function SiteToolForm({ initial, onSave, onCancel }: { initial: SiteToolRow | null; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const parseTags = (t: string | string[] | null | undefined): string => {
    if (!t) return ""; if (Array.isArray(t)) return t.join(", ")
    try { return JSON.parse(t).join(", ") } catch { return String(t) }
  }
  const [form, setForm] = useState({
    id: initial?.id || "",
    title_zh: initial?.title_zh || "", title_en: initial?.title_en || "",
    description_zh: initial?.description_zh || "", description_en: initial?.description_en || "",
    url: initial?.url || "", icon: initial?.icon || "", tags: parseTags(initial?.tags),
    type: initial?.table === "tool" ? "tool" : "site",
    since: initial?.since || "", sort_order: initial?.sort_order || 0,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }) }} className="mb-6 rounded-xl border border-primary/30 bg-card p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-bold text-foreground">{initial ? "Edit" : "New"} Site/Tool</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="ID" value={form.id} onChange={(v) => set("id", v)} required disabled={!!initial} />
        <SelectField label="Type" value={form.type} onChange={(v) => set("type", v)} options={[{ value: "site", label: "Personal Site" }, { value: "tool", label: "Tool" }]} />
        <InputField label="Title (zh)" value={form.title_zh} onChange={(v) => set("title_zh", v)} required />
        <InputField label="Title (en)" value={form.title_en} onChange={(v) => set("title_en", v)} required />
        <TextAreaField label="Description (zh)" value={form.description_zh} onChange={(v) => set("description_zh", v)} />
        <TextAreaField label="Description (en)" value={form.description_en} onChange={(v) => set("description_en", v)} />
        <InputField label="URL" value={form.url} onChange={(v) => set("url", v)} required />
        <InputField label="Icon (iconify)" value={form.icon} onChange={(v) => set("icon", v)} />
        <InputField label="Tags (comma separated)" value={form.tags} onChange={(v) => set("tags", v)} />
        {form.type === "site" && <InputField label="Since Year" value={form.since} onChange={(v) => set("since", v)} />}
        <InputField label="Sort Order" value={String(form.sort_order)} onChange={(v) => set("sort_order", parseInt(v) || 0)} type="number" />
      </div>
      {form.icon && <IconPreview icon={form.icon} />}
      <div className="mt-4 flex items-center gap-3">
        <AdminButton type="submit">Save</AdminButton>
        <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
      </div>
    </form>
  )
}
