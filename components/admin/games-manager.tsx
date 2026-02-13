"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, AdminButton, IconPreview } from "./form-fields"

function GameLogo({ icon, className }: { icon?: string | null; className?: string }) {
    if (!icon) return <Icon icon="mdi:gamepad-variant" className={className} />
    if (icon.startsWith("http")) return <img src={icon} alt="" className={`${className} object-contain`} />
    return <Icon icon={icon} className={className} />
}

interface GameRow {
    id: string
    title_zh: string
    title_en: string
    icon: string | null
    hours_played: string | null
    max_level: string | null
    account_name: string | null
    show_account: boolean | number
    url: string | null
    sort_order: number
}

export function GamesManager() {
    const [items, setItems] = useState<GameRow[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<GameRow | null>(null)
    const [showForm, setShowForm] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/games")
            if (res.ok) setItems(await res.json())
        } finally {
            setLoading(false)
        }
    }, [])
    useEffect(() => { fetchItems() }, [fetchItems])

    const handleSave = async (data: Record<string, unknown>) => {
        const res = await fetch("/api/admin/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this game?")) return
        await fetch("/api/admin/games", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        fetchItems()
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                    <Icon icon="mdi:gamepad-variant-outline" className="mr-2 inline h-5 w-5 text-primary" />
                    Games ({items.length})
                </h2>
                <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}>
                    <Icon icon="mdi:plus" className="h-4 w-4" /> Add Game
                </AdminButton>
            </div>

            {showForm && (
                <GameForm
                    initial={editing}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditing(null) }}
                />
            )}

            <div className="flex flex-col gap-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.icon && (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground overflow-hidden">
                                    <GameLogo icon={item.icon} className="h-5 w-5" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-foreground truncate">{item.title_zh}</h3>
                                    <span className="text-[10px] text-muted-foreground/60 font-mono">{item.title_en}</span>
                                </div>
                                <p className="font-mono text-[10px] text-muted-foreground truncate">
                                    {item.hours_played ? `${item.hours_played}h` : ""}
                                    {item.max_level ? ` · Lv: ${item.max_level}` : ""}
                                    {item.account_name ? ` · ${item.show_account ? "👁" : "🔒"} ${item.account_name}` : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                            <button
                                onClick={() => { setEditing(item); setShowForm(true) }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                                <Icon icon="mdi:pencil-outline" className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                            >
                                <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        <Icon icon="mdi:gamepad-variant-outline" className="mx-auto mb-2 h-8 w-8 opacity-30" />
                        <p>No games yet. Click &quot;Add Game&quot; to get started!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function GameForm({
    initial,
    onSave,
    onCancel,
}: {
    initial: GameRow | null
    onSave: (d: Record<string, unknown>) => void
    onCancel: () => void
}) {
    const [form, setForm] = useState({
        id: initial?.id || "",
        title_zh: initial?.title_zh || "",
        title_en: initial?.title_en || "",
        icon: initial?.icon || "",
        hours_played: initial?.hours_played || "",
        max_level: initial?.max_level || "",
        account_name: initial?.account_name || "",
        show_account: !!(initial?.show_account),
        url: initial?.url || "",
        sort_order: initial?.sort_order || 0,
    })
    const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSave(form)
            }}
            className="mb-6 rounded-xl border border-primary/30 bg-card p-6"
        >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Icon icon="mdi:gamepad-variant" className="h-4 w-4 text-primary" />
                {initial ? "Edit" : "New"} Game
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <InputField label="ID" value={form.id} onChange={(v) => set("id", v)} required disabled={!!initial} />
                <InputField label="Sort Order" value={String(form.sort_order)} onChange={(v) => set("sort_order", parseInt(v) || 0)} type="number" />
                <InputField label="Game Name (zh)" value={form.title_zh} onChange={(v) => set("title_zh", v)} required />
                <InputField label="Game Name (en)" value={form.title_en} onChange={(v) => set("title_en", v)} required />
                <InputField label="Icon (iconify or image URL)" value={form.icon} onChange={(v) => set("icon", v)} placeholder="simple-icons:minecraft or https://...logo.svg" />
                <InputField label="Game URL" value={form.url} onChange={(v) => set("url", v)} placeholder="Steam / Official page" />
                <InputField label="Hours Played" value={form.hours_played} onChange={(v) => set("hours_played", v)} placeholder="e.g. 100+" />
                <InputField label="Max Level / Rank" value={form.max_level} onChange={(v) => set("max_level", v)} placeholder="e.g. AR 55, Diamond" />
                <InputField label="Account Name / UID" value={form.account_name} onChange={(v) => set("account_name", v)} placeholder="In-game username or UID" />
                <div className="flex items-center gap-3">
                    <label className="mb-1.5 block text-xs font-mono text-muted-foreground">Show Account Publicly</label>
                    <button
                        type="button"
                        onClick={() => set("show_account", !form.show_account)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.show_account ? "bg-primary" : "bg-secondary"}`}
                    >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.show_account ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <span className="text-xs text-muted-foreground">{form.show_account ? "Visible" : "Hidden"}</span>
                </div>
            </div>
            {form.icon && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Preview:</span>
                    {form.icon.startsWith("http") ? (
                        <img src={form.icon} alt="preview" className="h-8 w-8 object-contain" />
                    ) : (
                        <Icon icon={form.icon} className="h-8 w-8" />
                    )}
                </div>
            )}
            <div className="mt-4 flex items-center gap-3">
                <AdminButton type="submit">Save</AdminButton>
                <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
            </div>
        </form>
    )
}
