"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, SelectField, AdminButton, IconPreview } from "./form-fields"

interface SkillRow { id: number; name: string; icon: string; category: string; sort_order: number }

export function SkillsManager() {
  const [items, setItems] = useState<SkillRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<SkillRow | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/skills"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
  }
  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return
    await fetch("/api/admin/skills", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchItems()
  }

  const grouped = items.reduce<Record<string, SkillRow[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Skills ({items.length})</h2>
        <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}><Icon icon="mdi:plus" className="h-4 w-4" /> Add</AdminButton>
      </div>
      {showForm && <SkillForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}
      {Object.entries(grouped).map(([cat, skills]) => (
        <div key={cat} className="mb-6">
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">{cat}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {skills.map((s) => (
              <div key={s.id} className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2"><Icon icon={s.icon} className="h-5 w-5" /><span className="text-xs text-foreground">{s.name}</span></div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(s); setShowForm(true) }} className="text-muted-foreground hover:text-primary"><Icon icon="mdi:pencil-outline" className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive"><Icon icon="mdi:delete-outline" className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SkillForm({ initial, onSave, onCancel }: { initial: SkillRow | null; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || undefined, name: initial?.name || "", icon: initial?.icon || "",
    category: initial?.category || "frontend", sort_order: initial?.sort_order || 0,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const cats = ["frontend", "backend", "devops", "design", "os", "ops"].map((c) => ({ value: c, label: c }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="mb-6 rounded-xl border border-primary/30 bg-card p-6">
      <h3 className="mb-4 text-sm font-bold text-foreground">{initial ? "Edit" : "New"} Skill</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
        <InputField label="Icon (iconify)" value={form.icon} onChange={(v) => set("icon", v)} required />
        <SelectField label="Category" value={form.category} onChange={(v) => set("category", v)} options={cats} />
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
