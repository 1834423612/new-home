"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, AdminButton } from "./form-fields"

interface FortuneTag { id: number; text_zh: string; text_en: string }

export function FortuneManager() {
  const [items, setItems] = useState<FortuneTag[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FortuneTag | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ text_zh: "", text_en: "" })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/fortune"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  const openNew = () => { setEditing(null); setForm({ text_zh: "", text_en: "" }); setShowForm(true) }
  const openEdit = (item: FortuneTag) => { setEditing(item); setForm({ text_zh: item.text_zh, text_en: item.text_en }); setShowForm(true) }

  const handleSave = async () => {
    const body = editing ? { id: editing.id, ...form } : form
    const res = await fetch("/api/admin/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
  }
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this fortune tag?")) return
    await fetch("/api/admin/fortune", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchItems()
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Fortune Tags ({items.length})</h2>
        <AdminButton onClick={openNew}><Icon icon="mdi:plus" className="h-4 w-4" /> Add</AdminButton>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="mb-6 rounded-xl border border-primary/30 bg-card p-6">
          <h3 className="mb-4 text-sm font-bold text-foreground">{editing ? "Edit" : "New"} Fortune Tag</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Text (zh)" value={form.text_zh} onChange={(v) => setForm((f) => ({ ...f, text_zh: v }))} required />
            <InputField label="Text (en)" value={form.text_en} onChange={(v) => setForm((f) => ({ ...f, text_en: v }))} required />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <AdminButton type="submit">Save</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</AdminButton>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.text_zh}</p>
              <p className="text-xs text-muted-foreground truncate">{item.text_en}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button onClick={() => openEdit(item)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Icon icon="mdi:pencil-outline" className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"><Icon icon="mdi:delete-outline" className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No fortune tags yet. Add some above.</p>}
      </div>
    </div>
  )
}
