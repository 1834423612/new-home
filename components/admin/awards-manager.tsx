"use client"

import React from "react"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, TextAreaField, AdminButton } from "./form-fields"
import { RichTextEditor } from "./rich-text-editor"
import { useSortable } from "@/hooks/use-sortable"
import { SortToolbar, SortList, SortBadge } from "./sort-controls"

interface AwardRow {
  id: string; slug: string; title_zh: string; title_en: string
  description_zh: string; description_en: string; detail_zh: string; detail_en: string
  org_zh: string; org_en: string; date: string; level: string | null
  image: string | null; official_links: string | null; sort_order: number
}

export function AwardsManager() {
  const [items, setItems] = useState<AwardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AwardRow | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch("/api/admin/awards"); if (res.ok) setItems(await res.json()) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchItems() }, [fetchItems])

  const sort = useSortable<AwardRow>({
    items,
    apiEndpoint: "/api/admin/awards",
    onRefresh: fetchItems,
  })

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/awards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
  }
  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return
    await fetch("/api/admin/awards", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    fetchItems()
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Awards ({items.length})</h2>
        <SortToolbar
          sortMode={sort.sortMode}
          sortSaving={sort.sortSaving}
          onEnterSort={sort.enterSortMode}
          onSaveSort={sort.saveSortOrder}
          onCancelSort={sort.cancelSortMode}
        >
          <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}><Icon icon="mdi:plus" className="h-4 w-4" /> Add Award</AdminButton>
        </SortToolbar>
      </div>
      {!sort.sortMode && showForm && <AwardForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}
      {sort.sortMode ? (
        <SortList
          items={sort.sortItems}
          onDragStart={sort.handleDragStart}
          onDragEnter={sort.handleDragEnter}
          onDragEnd={sort.handleDragEnd}
          onMove={sort.moveItem}
          renderLabel={(item) => (
            <div className="flex items-center gap-2">
              <Icon icon="mdi:trophy-outline" className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-bold text-foreground truncate">{item.title_zh}</p>
              {item.level && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-secondary-foreground">{item.level}</span>}
            </div>
          )}
        />
      ) : (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon icon="mdi:trophy-outline" className="h-4 w-4 text-primary shrink-0" />
                <SortBadge order={item.sort_order} />
                <h3 className="text-sm font-bold text-foreground truncate">{item.title_zh}</h3>
                {item.level && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-secondary-foreground">{item.level}</span>}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-1 truncate">{item.org_zh} / {item.date} / slug: {item.slug}</p>
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

function AwardForm({ initial, onSave, onCancel }: { initial: AwardRow | null; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const parseLinks = (s: string | null | undefined): string => {
    if (!s) return ""
    try { return JSON.parse(s).map((l: { title: string; url: string }) => `${l.title}|${l.url}`).join("\n") } catch { return "" }
  }
  const [form, setForm] = useState({
    id: initial?.id || "", slug: initial?.slug || "",
    title_zh: initial?.title_zh || "", title_en: initial?.title_en || "",
    description_zh: initial?.description_zh || "", description_en: initial?.description_en || "",
    detail_zh: initial?.detail_zh || "", detail_en: initial?.detail_en || "",
    org_zh: initial?.org_zh || "", org_en: initial?.org_en || "",
    date: initial?.date || "", level: initial?.level || "",
    image: initial?.image || "", official_links_text: parseLinks(initial?.official_links),
    sort_order: initial?.sort_order || 0,
  })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const official_links = form.official_links_text.split("\n").filter(Boolean).map((line) => {
      const [title, url] = line.split("|")
      return { title: title?.trim() || "", url: url?.trim() || "" }
    }).filter((l) => l.title && l.url)
    onSave({ ...form, official_links })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-primary/30 bg-card p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-bold text-foreground">{initial ? "Edit" : "New"} Award</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="ID" value={form.id} onChange={(v) => set("id", v)} required disabled={!!initial} />
        <InputField label="URL Slug" value={form.slug} onChange={(v) => set("slug", v)} required />
        <InputField label="Title (zh)" value={form.title_zh} onChange={(v) => set("title_zh", v)} required />
        <InputField label="Title (en)" value={form.title_en} onChange={(v) => set("title_en", v)} required />
        <InputField label="Org (zh)" value={form.org_zh} onChange={(v) => set("org_zh", v)} />
        <InputField label="Org (en)" value={form.org_en} onChange={(v) => set("org_en", v)} />
        <TextAreaField label="Description (zh)" value={form.description_zh} onChange={(v) => set("description_zh", v)} />
        <TextAreaField label="Description (en)" value={form.description_en} onChange={(v) => set("description_en", v)} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InputField label="Date" value={form.date} onChange={(v) => set("date", v)} />
        <InputField label="Level" value={form.level} onChange={(v) => set("level", v)} placeholder="e.g. Regional, National" />
        <InputField label="Image URL" value={form.image} onChange={(v) => set("image", v)} />
        <InputField label="Sort Order" value={String(form.sort_order)} onChange={(v) => set("sort_order", parseInt(v) || 0)} type="number" />
      </div>
      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Icon icon="mdi:file-document-edit-outline" className="h-3.5 w-3.5 text-primary" />
            Detail (Rich Text)
          </h4>
          {form.detail_zh && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Copy Chinese detail to English? This overwrites the current English content.\n\nMedia embeds will be kept -- you only need to translate text.")) {
                  set("detail_en", form.detail_zh)
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Icon icon="mdi:content-copy" className="h-3 w-3" />
              Copy zh to en
            </button>
          )}
        </div>
        <div className="grid gap-4">
          <RichTextEditor label="Detail (zh)" value={form.detail_zh} onChange={(v) => set("detail_zh", v)} />
          <RichTextEditor label="Detail (en)" value={form.detail_en} onChange={(v) => set("detail_en", v)} />
        </div>
      </div>
      <div className="mt-4">
        <TextAreaField
          label="Official Links (one per line: Title|URL)"
          value={form.official_links_text}
          onChange={(v) => set("official_links_text", v)}
          rows={3}
        />
        <p className="mt-1 text-[10px] text-muted-foreground">{'Format: "Link Title|https://example.com" one per line'}</p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <AdminButton type="submit">Save</AdminButton>
        <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
      </div>
    </form>
  )
}
