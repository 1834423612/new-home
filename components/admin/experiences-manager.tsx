"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { InputField, TextAreaField, AdminButton, IconPreview } from "./form-fields"

interface ExperienceRow {
  id: string; title_zh: string; title_en: string; org_zh: string; org_en: string
  description_zh: string; description_en: string; start_date: string
  end_date: string | null; icon: string | null; sort_order: number
}

export function ExperiencesManager() {
  const [items, setItems] = useState<ExperienceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ExperienceRow | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [sortMode, setSortMode] = useState(false)
  const [sortItems, setSortItems] = useState<ExperienceRow[]>([])
  const [sortSaving, setSortSaving] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/experiences"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
  }
  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return
    await fetch("/api/admin/experiences", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchItems()
  }

  // Sort mode
  const enterSortMode = () => {
    setSortItems(items.map((item, i) => ({ ...item, sort_order: item.sort_order ?? i })))
    setSortMode(true)
  }
  const cancelSortMode = () => { setSortMode(false); setSortItems([]) }

  const handleDragStart = (index: number) => { dragItem.current = index }
  const handleDragEnter = (index: number) => { dragOverItem.current = index }
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    const list = [...sortItems]
    const draggedItem = list[dragItem.current]
    list.splice(dragItem.current, 1)
    list.splice(dragOverItem.current, 0, draggedItem)
    const reordered = list.map((item, i) => ({ ...item, sort_order: i }))
    setSortItems(reordered)
    dragItem.current = null
    dragOverItem.current = null
  }

  const moveSortItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= sortItems.length) return
    const list = [...sortItems]
    const temp = list[index]
    list[index] = list[newIndex]
    list[newIndex] = temp
    setSortItems(list.map((item, i) => ({ ...item, sort_order: i })))
  }

  const handleSaveSortOrder = async () => {
    setSortSaving(true)
    try {
      for (const item of sortItems) {
        await fetch("/api/admin/experiences", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      }
      setSortMode(false)
      setSortItems([])
      fetchItems()
    } finally { setSortSaving(false) }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-foreground">Experiences ({items.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {sortMode ? (
            <>
              <AdminButton onClick={handleSaveSortOrder} disabled={sortSaving}>
                <Icon icon={sortSaving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${sortSaving ? "animate-spin" : ""}`} /> Save Order
              </AdminButton>
              <AdminButton variant="secondary" onClick={cancelSortMode}>Cancel</AdminButton>
            </>
          ) : (
            <>
              <AdminButton variant="secondary" onClick={enterSortMode}>
                <Icon icon="mdi:sort" className="h-4 w-4" /> Reorder
              </AdminButton>
              <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}>
                <Icon icon="mdi:plus" className="h-4 w-4" /> Add
              </AdminButton>
            </>
          )}
        </div>
      </div>
      {showForm && !sortMode && <ExperienceForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}

      {sortMode ? (
        <div className="flex flex-col gap-1">
          {sortItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 sm:p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
            >
              <Icon icon="mdi:drag-vertical" className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="flex h-6 min-w-[28px] items-center justify-center rounded bg-primary/10 text-[11px] font-mono font-bold text-primary shrink-0">{index}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{item.title_zh}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.org_zh}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => moveSortItem(index, -1)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors">
                  <Icon icon="mdi:arrow-up" className="h-4 w-4" />
                </button>
                <button onClick={() => moveSortItem(index, 1)} disabled={index === sortItems.length - 1} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors">
                  <Icon icon="mdi:arrow-down" className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="flex h-6 min-w-[28px] items-center justify-center rounded bg-secondary text-[10px] font-mono font-bold text-muted-foreground shrink-0">#{item.sort_order}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground truncate">{item.title_zh}</h3>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{item.org_zh} / {item.start_date} - {item.end_date || "Present"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button onClick={() => { setEditing(item); setShowForm(true) }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Icon icon="mdi:pencil-outline" className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"><Icon icon="mdi:delete-outline" className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ExperienceForm({ initial, onSave, onCancel }: { initial: ExperienceRow | null; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || "", title_zh: initial?.title_zh || "", title_en: initial?.title_en || "",
    org_zh: initial?.org_zh || "", org_en: initial?.org_en || "",
    description_zh: initial?.description_zh || "", description_en: initial?.description_en || "",
    start_date: initial?.start_date || "", end_date: initial?.end_date || "",
    icon: initial?.icon || "", sort_order: initial?.sort_order || 0,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="mb-6 rounded-xl border border-primary/30 bg-card p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-bold text-foreground">{initial ? "Edit" : "New"} Experience</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="ID" value={form.id} onChange={(v) => set("id", v)} required disabled={!!initial} />
        <InputField label="Icon (iconify)" value={form.icon} onChange={(v) => set("icon", v)} />
        <InputField label="Title (zh)" value={form.title_zh} onChange={(v) => set("title_zh", v)} required />
        <InputField label="Title (en)" value={form.title_en} onChange={(v) => set("title_en", v)} required />
        <InputField label="Org (zh)" value={form.org_zh} onChange={(v) => set("org_zh", v)} />
        <InputField label="Org (en)" value={form.org_en} onChange={(v) => set("org_en", v)} />
        <TextAreaField label="Description (zh)" value={form.description_zh} onChange={(v) => set("description_zh", v)} />
        <TextAreaField label="Description (en)" value={form.description_en} onChange={(v) => set("description_en", v)} />
        <InputField label="Start Date" value={form.start_date} onChange={(v) => set("start_date", v)} />
        <InputField label="End Date" value={form.end_date} onChange={(v) => set("end_date", v)} />
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
