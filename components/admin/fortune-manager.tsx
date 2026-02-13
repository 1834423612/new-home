"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Icon } from "@iconify/react"
import { InputField, AdminButton } from "./form-fields"

interface FortuneTag { id: number; text_zh: string; text_en: string }

const PAGE_SIZES = [10, 20, 50, 100] as const

export function FortuneManager() {
  const [items, setItems] = useState<FortuneTag[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ text_zh: "", text_en: "" })
  const [showAdd, setShowAdd] = useState(false)
  const [showBatchAdd, setShowBatchAdd] = useState(false)
  const [addForm, setAddForm] = useState({ text_zh: "", text_en: "" })
  const [batchAddText, setBatchAddText] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [batchEditMode, setBatchEditMode] = useState(false)
  const [batchEdits, setBatchEdits] = useState<Record<number, { text_zh: string; text_en: string }>>({})

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/fortune"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  // Filtered and paginated items
  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(i => i.text_zh.toLowerCase().includes(q) || i.text_en.toLowerCase().includes(q) || String(i.id).includes(q))
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page when search or pageSize changes
  useEffect(() => { setPage(1) }, [search, pageSize])

  const startEdit = (item: FortuneTag) => {
    setEditingId(item.id)
    setEditForm({ text_zh: item.text_zh, text_en: item.text_en })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ text_zh: "", text_en: "" })
  }

  const handleSaveEdit = async (id: number) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...editForm }) })
      if (res.ok) { setEditingId(null); fetchItems() }
    } finally { setSaving(false) }
  }

  const handleAdd = async () => {
    if (!addForm.text_zh.trim() || !addForm.text_en.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) })
      if (res.ok) { setShowAdd(false); setAddForm({ text_zh: "", text_en: "" }); fetchItems() }
    } finally { setSaving(false) }
  }

  const handleBatchAdd = async () => {
    const lines = batchAddText.split("\n").map(l => l.trim()).filter(Boolean)
    const entries = lines.map(line => {
      const sep = line.indexOf("|")
      if (sep === -1) return null
      const text_zh = line.slice(0, sep).trim()
      const text_en = line.slice(sep + 1).trim()
      if (!text_zh || !text_en) return null
      return { text_zh, text_en }
    }).filter(Boolean) as { text_zh: string; text_en: string }[]
    if (entries.length === 0) return
    setSaving(true)
    try {
      for (const entry of entries) {
        await fetch("/api/admin/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) })
      }
      setShowBatchAdd(false); setBatchAddText(""); fetchItems()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this fortune tag?")) return
    await fetch("/api/admin/fortune", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
    fetchItems()
  }

  const handleBatchDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} selected fortune tags?`)) return
    for (const id of selected) {
      await fetch("/api/admin/fortune", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    }
    setSelected(new Set())
    fetchItems()
  }

  // Batch edit
  const enterBatchEdit = () => {
    const edits: Record<number, { text_zh: string; text_en: string }> = {}
    for (const item of items) {
      if (selected.has(item.id)) edits[item.id] = { text_zh: item.text_zh, text_en: item.text_en }
    }
    setBatchEdits(edits)
    setBatchEditMode(true)
    setEditingId(null)
  }

  const cancelBatchEdit = () => {
    setBatchEditMode(false)
    setBatchEdits({})
  }

  const handleSaveBatchEdit = async () => {
    const ids = Object.keys(batchEdits).map(Number)
    if (ids.length === 0) return
    setSaving(true)
    try {
      for (const id of ids) {
        const edit = batchEdits[id]
        await fetch("/api/admin/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...edit }) })
      }
      setBatchEditMode(false); setBatchEdits({}); setSelected(new Set()); fetchItems()
    } finally { setSaving(false) }
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const toggleSelectAll = () => {
    const pageIds = paginatedItems.map(i => i.id)
    const allSelected = pageIds.every(id => selected.has(id))
    setSelected(prev => {
      const n = new Set(prev)
      if (allSelected) { pageIds.forEach(id => n.delete(id)) } else { pageIds.forEach(id => n.add(id)) }
      return n
    })
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  const batchAddLineCount = batchAddText.split("\n").map(l => l.trim()).filter(l => l && l.includes("|")).length

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Fortune Tags</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} total{filtered.length !== items.length && ` · ${filtered.length} matching`}{selected.size > 0 && ` · ${selected.size} selected`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && !batchEditMode && (
            <>
              <AdminButton variant="secondary" onClick={enterBatchEdit}>
                <Icon icon="mdi:pencil-outline" className="h-4 w-4" /> Edit ({selected.size})
              </AdminButton>
              <AdminButton variant="danger" onClick={handleBatchDelete}>
                <Icon icon="mdi:delete-outline" className="h-4 w-4" /> Delete ({selected.size})
              </AdminButton>
            </>
          )}
          {batchEditMode && (
            <>
              <AdminButton onClick={handleSaveBatchEdit} disabled={saving}>
                <Icon icon={saving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} /> Save All ({Object.keys(batchEdits).length})
              </AdminButton>
              <AdminButton variant="secondary" onClick={cancelBatchEdit}>Cancel</AdminButton>
            </>
          )}
          {!batchEditMode && (
            <>
              <AdminButton variant="secondary" onClick={() => { setShowBatchAdd(true); setShowAdd(false) }}>
                <Icon icon="mdi:playlist-plus" className="h-4 w-4" /> Batch Add
              </AdminButton>
              <AdminButton onClick={() => { setShowAdd(true); setShowBatchAdd(false); setEditingId(null) }}>
                <Icon icon="mdi:plus" className="h-4 w-4" /> Add
              </AdminButton>
            </>
          )}
        </div>
      </div>

      {/* Search bar + page size */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fortune tags..."
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon icon="mdi:close-circle" className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground font-mono">Per page:</span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Single add form */}
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="mb-4 rounded-xl border border-primary/30 bg-card p-4">
          <h3 className="mb-3 text-sm font-bold text-foreground">New Fortune Tag</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField label="Text (zh)" value={addForm.text_zh} onChange={v => setAddForm(f => ({ ...f, text_zh: v }))} required />
            <InputField label="Text (en)" value={addForm.text_en} onChange={v => setAddForm(f => ({ ...f, text_en: v }))} required />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <AdminButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowAdd(false)}>Cancel</AdminButton>
          </div>
        </form>
      )}

      {/* Batch add form */}
      {showBatchAdd && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-card p-4">
          <h3 className="mb-1 text-sm font-bold text-foreground">Batch Add Fortune Tags</h3>
          <p className="mb-3 text-[10px] text-muted-foreground">One per line, format: <code className="rounded bg-secondary px-1 py-0.5">Chinese text | English text</code></p>
          <textarea
            value={batchAddText}
            onChange={e => setBatchAddText(e.target.value)}
            rows={6}
            placeholder={"今天会收获惊喜 | A surprise awaits you today\n财运亨通 | Fortune smiles upon you\n万事如意 | Everything goes well"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none transition-colors resize-y"
          />
          <div className="mt-3 flex items-center gap-2">
            <AdminButton onClick={handleBatchAdd} disabled={saving || batchAddLineCount === 0}>
              <Icon icon={saving ? "mdi:loading" : "mdi:playlist-plus"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Adding..." : `Add ${batchAddLineCount} tag${batchAddLineCount !== 1 ? "s" : ""}`}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowBatchAdd(false); setBatchAddText("") }}>Cancel</AdminButton>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-[40px_1fr_1fr_80px] gap-2 bg-secondary/50 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="flex items-center">
            <input type="checkbox" checked={paginatedItems.length > 0 && paginatedItems.every(i => selected.has(i.id))} onChange={toggleSelectAll} className="h-3.5 w-3.5 rounded border-border accent-primary" />
          </div>
          <div>Chinese</div>
          <div>English</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Items */}
        <div className="divide-y divide-border">
          {paginatedItems.map((item) => {
            const isEditing = editingId === item.id
            const isBatchEditing = batchEditMode && selected.has(item.id)
            return (
              <div key={item.id} className={`group transition-colors ${isEditing || isBatchEditing ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}>
                {isEditing ? (
                  <div className="p-3 sm:p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-mono text-muted-foreground">Chinese</label>
                        <input
                          value={editForm.text_zh}
                          onChange={e => setEditForm(f => ({ ...f, text_zh: e.target.value }))}
                          className="w-full rounded-lg border border-primary/50 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-mono text-muted-foreground">English</label>
                        <input
                          value={editForm.text_en}
                          onChange={e => setEditForm(f => ({ ...f, text_en: e.target.value }))}
                          className="w-full rounded-lg border border-primary/50 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveEdit(item.id) } else if (e.key === 'Escape') cancelEdit() }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => handleSaveEdit(item.id)} disabled={saving} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                        <Icon icon="mdi:check" className="h-3.5 w-3.5" /> Save
                      </button>
                      <button onClick={cancelEdit} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                        <Icon icon="mdi:close" className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : isBatchEditing ? (
                  <div className="flex items-start gap-2 px-3 py-2.5 sm:grid sm:grid-cols-[40px_1fr_1fr_80px] sm:gap-2 sm:px-4">
                    <div className="flex items-center pt-2 shrink-0">
                      <input type="checkbox" checked onChange={() => toggleSelect(item.id)} className="h-3.5 w-3.5 rounded border-border accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        value={batchEdits[item.id]?.text_zh ?? item.text_zh}
                        onChange={e => setBatchEdits(prev => ({ ...prev, [item.id]: { text_zh: e.target.value, text_en: prev[item.id]?.text_en ?? item.text_en } }))}
                        className="w-full rounded border border-primary/30 bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        value={batchEdits[item.id]?.text_en ?? item.text_en}
                        onChange={e => setBatchEdits(prev => ({ ...prev, [item.id]: { text_zh: prev[item.id]?.text_zh ?? item.text_zh, text_en: e.target.value } }))}
                        className="w-full rounded border border-primary/30 bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 sm:grid sm:grid-cols-[40px_1fr_1fr_80px] sm:gap-2 sm:px-4">
                    <div className="flex items-center shrink-0">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="h-3.5 w-3.5 rounded border-border accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0 sm:flex-none">
                      <p className="text-sm text-foreground truncate" title={item.text_zh}>{item.text_zh}</p>
                      <p className="text-xs text-muted-foreground truncate sm:hidden" title={item.text_en}>{item.text_en}</p>
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <p className="text-sm text-muted-foreground truncate" title={item.text_en}>{item.text_en}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0 sm:justify-end">
                      <button onClick={() => startEdit(item)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <Icon icon="mdi:pencil-outline" className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                        <Icon icon="mdi:delete-outline" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Icon icon="mdi:ticket-outline" className="h-8 w-8 opacity-30" />
            <p className="text-sm">{search ? "No matching tags found" : "No fortune tags yet"}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Icon icon="mdi:chevron-double-left" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Icon icon="mdi:chevron-left" className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-muted-foreground">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg border text-xs font-mono transition-colors ${
                      currentPage === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Icon icon="mdi:chevron-right" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Icon icon="mdi:chevron-double-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
