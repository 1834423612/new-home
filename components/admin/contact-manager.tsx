"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, SelectField, AdminButton, IconPreview } from "./form-fields"

interface SocialLinkRow {
    id: number
    name: string
    icon: string
    url: string | null
    link_type: "link" | "text"
    text_content: string | null
    color: string
    sort_order: number
    visible: boolean | number
}

export function ContactManager() {
    const [items, setItems] = useState<SocialLinkRow[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<SocialLinkRow | null>(null)
    const [showForm, setShowForm] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/social-links")
            if (res.ok) setItems(await res.json())
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    const handleSave = async (data: Record<string, unknown>) => {
        const res = await fetch("/api/admin/social-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) { setShowForm(false); setEditing(null); fetchItems() }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this contact?")) return
        await fetch("/api/admin/social-links", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        fetchItems()
    }

    const handleToggleVisible = async (item: SocialLinkRow) => {
        await fetch("/api/admin/social-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, visible: !item.visible }),
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

    const visibleItems = items.filter((i) => i.visible)
    const hiddenItems = items.filter((i) => !i.visible)

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Contact / Social Links ({items.length})</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Manage social links and contact methods displayed in the Contact section
                    </p>
                </div>
                <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}>
                    <Icon icon="mdi:plus" className="h-4 w-4" /> Add
                </AdminButton>
            </div>

            {showForm && (
                <ContactForm
                    initial={editing}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditing(null) }}
                />
            )}

            {/* Visible items */}
            {visibleItems.length > 0 && (
                <div className="mb-6">
                    <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">
                        Visible ({visibleItems.length})
                    </h3>
                    <div className="space-y-2">
                        {visibleItems.map((item) => (
                            <ContactCard
                                key={item.id}
                                item={item}
                                onEdit={() => { setEditing(item); setShowForm(true) }}
                                onDelete={() => handleDelete(item.id)}
                                onToggleVisible={() => handleToggleVisible(item)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden items */}
            {hiddenItems.length > 0 && (
                <div className="mb-6">
                    <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Hidden ({hiddenItems.length})
                    </h3>
                    <div className="space-y-2">
                        {hiddenItems.map((item) => (
                            <ContactCard
                                key={item.id}
                                item={item}
                                onEdit={() => { setEditing(item); setShowForm(true) }}
                                onDelete={() => handleDelete(item.id)}
                                onToggleVisible={() => handleToggleVisible(item)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {items.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                    <Icon icon="mdi:contacts-outline" className="h-12 w-12 opacity-30" />
                    <p className="text-sm">No contact methods yet. Click &quot;Add&quot; to create one.</p>
                </div>
            )}
        </div>
    )
}

/* ─── Card ─── */
function ContactCard({
    item,
    onEdit,
    onDelete,
    onToggleVisible,
}: {
    item: SocialLinkRow
    onEdit: () => void
    onDelete: () => void
    onToggleVisible: () => void
}) {
    const isVisible = !!item.visible
    const isTextType = item.link_type === "text"

    return (
        <div
            className={`group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors ${isVisible ? "border-border hover:border-primary/30" : "border-border/50 opacity-60 hover:opacity-80"
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Color dot + icon */}
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                >
                    <Icon icon={item.icon} className="h-5 w-5" style={{ color: item.color }} />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        {/* Type badge */}
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${isTextType
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-blue-500/10 text-blue-500"
                                }`}
                        >
                            {isTextType ? "TEXT" : "LINK"}
                        </span>
                        {!isVisible && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                                HIDDEN
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                        {isTextType ? (item.text_content || "—") : (item.url || "#")}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={onToggleVisible}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title={isVisible ? "Hide" : "Show"}
                >
                    <Icon icon={isVisible ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="h-4 w-4" />
                </button>
                <button
                    onClick={onEdit}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                    title="Edit"
                >
                    <Icon icon="mdi:pencil-outline" className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                    title="Delete"
                >
                    <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

/* ─── Form ─── */
function ContactForm({
    initial,
    onSave,
    onCancel,
}: {
    initial: SocialLinkRow | null
    onSave: (d: Record<string, unknown>) => void
    onCancel: () => void
}) {
    const [form, setForm] = useState({
        id: initial?.id || undefined,
        name: initial?.name || "",
        icon: initial?.icon || "",
        url: initial?.url || "",
        link_type: initial?.link_type || "link",
        text_content: initial?.text_content || "",
        color: initial?.color || "#ffffff",
        sort_order: initial?.sort_order || 0,
        visible: initial ? !!initial.visible : true,
    })

    const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

    const linkTypeOptions = [
        { value: "link", label: "Link — has URL (e.g. GitHub, Email)" },
        { value: "text", label: "Text — no link, show text on click (e.g. WeChat)" },
    ]

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onSave(form) }}
            className="mb-6 rounded-xl border border-primary/30 bg-card p-6"
        >
            <h3 className="mb-4 text-sm font-bold text-foreground">
                {initial ? "Edit" : "New"} Contact Method
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                    label="Name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    placeholder="e.g. GitHub, WeChat, Email"
                    required
                />
                <InputField
                    label="Icon (Iconify)"
                    value={form.icon}
                    onChange={(v) => set("icon", v)}
                    placeholder="e.g. mdi:github, mdi:wechat"
                    required
                />
                <SelectField
                    label="Type"
                    value={form.link_type}
                    onChange={(v) => set("link_type", v)}
                    options={linkTypeOptions}
                />
                <div>
                    <label className="mb-1.5 block text-xs font-mono text-muted-foreground">Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={form.color}
                            onChange={(e) => set("color", e.target.value)}
                            className="h-9 w-10 cursor-pointer rounded-lg border border-border bg-background p-0.5"
                        />
                        <input
                            type="text"
                            value={form.color}
                            onChange={(e) => set("color", e.target.value)}
                            placeholder="#07c160"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Conditional: Link URL or Text Content */}
                {form.link_type === "link" ? (
                    <InputField
                        label="URL"
                        value={form.url}
                        onChange={(v) => set("url", v)}
                        placeholder="https://github.com/... or mailto:..."
                    />
                ) : (
                    <InputField
                        label="Text Content (shown on click)"
                        value={form.text_content}
                        onChange={(v) => set("text_content", v)}
                        placeholder="e.g. WeChat ID: kjchmc"
                    />
                )}

                <InputField
                    label="Sort Order"
                    value={String(form.sort_order)}
                    onChange={(v) => set("sort_order", parseInt(v) || 0)}
                    type="number"
                />
            </div>

            {/* Icon preview */}
            {form.icon && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Preview:</span>
                    <Icon icon={form.icon} className="h-6 w-6" style={{ color: form.color }} />
                    <span className="font-mono">{form.icon}</span>
                </div>
            )}

            {/* Visible toggle */}
            <div className="mt-4 flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.visible}
                        onChange={(e) => set("visible", e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-xs text-muted-foreground">Visible on front-end</span>
                </label>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <AdminButton type="submit">Save</AdminButton>
                <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
            </div>
        </form>
    )
}
