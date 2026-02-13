"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { AdminButton } from "./form-fields"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ProjectRow {
  id: string; title_zh: string; title_en: string; description_zh: string; description_en: string
  detail_zh?: string; detail_en?: string; slug?: string; links_json?: string | null
  category: string; tags: string | string[]; image: string | null; link: string | null
  source: string | null; date: string; featured: boolean | number; sort_order: number
}

const categoryColors: Record<string, string> = {
  website: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  tool: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  game: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  design: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  contribution: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
}

export function ProjectsManager() {
  const [items, setItems] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortMode, setSortMode] = useState(false)
  const [sortItems, setSortItems] = useState<ProjectRow[]>([])
  const [sortSaving, setSortSaving] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const parseTags = (t: string | string[]): string[] => {
    if (Array.isArray(t)) return t
    try { return JSON.parse(t) } catch { return [] }
  }

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/projects")
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

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
    setSortItems(list.map((item, i) => ({ ...item, sort_order: i })))
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
        const tags = parseTags(item.tags)
        await fetch("/api/admin/projects", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, tags }),
        })
      }
      setSortMode(false); setSortItems([]); fetchItems()
    } finally { setSortSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return
    await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchItems()
  }

  const toggleFeatured = async (item: ProjectRow) => {
    const tags = parseTags(item.tags)
    const newFeatured = !(item.featured === 1 || item.featured === true)
    await fetch("/api/admin/projects", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, tags, featured: newFeatured }),
    })
    fetchItems()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading projects...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Projects</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} projects total</p>
        </div>
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
              <Link href="/admin/projects/new">
                <AdminButton>
                  <Icon icon="mdi:plus" className="h-4 w-4" /> New Project
                </AdminButton>
              </Link>
            </>
          )}
        </div>
      </div>

      {sortMode ? (
        <div className="flex flex-col gap-1">
          {sortItems.map((item, index) => {
            const isFeatured = item.featured === 1 || item.featured === true
            return (
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground truncate">{item.title_zh}</p>
                    {isFeatured && <Icon icon="mdi:star" className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-mono", categoryColors[item.category] || "bg-secondary text-muted-foreground border-border")}>{item.category}</span>
                  </div>
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
            )
          })}
        </div>
      ) : (
      <div className="grid gap-3">
        {items.map((item) => {
          const tags = parseTags(item.tags)
          const isFeatured = item.featured === 1 || item.featured === true
          return (
            <div
              key={item.id}
              className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-start sm:gap-4 sm:p-4"
            >
              {/* Image thumbnail */}
              {item.image && (
                <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:block">
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground truncate">{item.title_zh}</h3>
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-mono",
                    categoryColors[item.category] || "bg-secondary text-muted-foreground border-border"
                  )}>
                    {item.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground truncate">{item.title_en}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] font-mono text-muted-foreground/60">
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:calendar-outline" className="h-3 w-3" /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:identifier" className="h-3 w-3" /> {item.slug || item.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:sort" className="h-3 w-3" /> #{item.sort_order}
                  </span>
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 5 && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{tags.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                <button
                  onClick={() => toggleFeatured(item)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                    isFeatured
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                      : "border-border text-muted-foreground hover:border-amber-500/30 hover:text-amber-500"
                  )}
                  title={isFeatured ? "Unstar" : "Star as featured"}
                >
                  <Icon icon={isFeatured ? "mdi:star" : "mdi:star-outline"} className="h-4 w-4" />
                </button>
                <Link
                  href={`/admin/projects/${item.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  title="Edit"
                >
                  <Icon icon="mdi:pencil-outline" className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon icon="mdi:folder-open-outline" className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-3 text-sm text-muted-foreground">No projects yet</p>
            <Link href="/admin/projects/new" className="mt-4">
              <AdminButton>
                <Icon icon="mdi:plus" className="h-4 w-4" /> Create your first project
              </AdminButton>
            </Link>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
