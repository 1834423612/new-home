"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, AdminButton, IconPreview } from "./form-fields"

/* ── Types ── */
interface FooterSponsor {
    id?: number
    name: string
    logo: string
    url: string
    sort_order: number
}

const empty: FooterSponsor = { name: "", logo: "", url: "", sort_order: 0 }

/* ══════════════════════════════════════════════════════════════
   Main Footer Manager – 3 sections
   ══════════════════════════════════════════════════════════════ */
export function FooterManager() {
    /* --- sponsors state --- */
    const [sponsors, setSponsors] = useState<FooterSponsor[]>([])
    const [sponsorLoading, setSponsorLoading] = useState(true)
    const [editing, setEditing] = useState<FooterSponsor | null>(null)
    const [showForm, setShowForm] = useState(false)

    /* --- site config state (ICP / visitor / text) --- */
    const [config, setConfig] = useState<Record<string, string>>({})
    const [configLoading, setConfigLoading] = useState(true)
    const [configDirty, setConfigDirty] = useState<Set<string>>(new Set())
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    /* --- active tab --- */
    const [activeTab, setActiveTab] = useState<"sponsors" | "filing" | "visitor">("sponsors")

    /* ── fetch sponsors ── */
    const fetchSponsors = useCallback(async () => {
        setSponsorLoading(true)
        try {
            const res = await fetch("/api/admin/footer-sponsors")
            if (res.ok) setSponsors(await res.json())
        } finally {
            setSponsorLoading(false)
        }
    }, [])

    /* ── fetch site config ── */
    const fetchConfig = useCallback(async () => {
        setConfigLoading(true)
        try {
            const res = await fetch("/api/admin/site-config")
            if (res.ok) setConfig(await res.json())
        } finally {
            setConfigLoading(false)
        }
    }, [])

    useEffect(() => { fetchSponsors(); fetchConfig() }, [fetchSponsors, fetchConfig])

    /* ── sponsor CRUD ── */
    const handleSaveSponsor = async (data: FooterSponsor) => {
        const res = await fetch("/api/admin/footer-sponsors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            setShowForm(false)
            setEditing(null)
            fetchSponsors()
        }
    }

    const handleDeleteSponsor = async (id: number) => {
        if (!confirm("Delete this sponsor?")) return
        await fetch("/api/admin/footer-sponsors", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
        fetchSponsors()
    }

    /* ── config helpers ── */
    const handleConfigChange = (key: string, value: string) => {
        setConfig((prev) => ({ ...prev, [key]: value }))
        setConfigDirty((prev) => new Set(prev).add(key))
        setMessage(null)
    }

    const handleSaveConfig = async (keys: string[]) => {
        setSaving(true)
        setMessage(null)
        try {
            const payload: Record<string, string> = {}
            for (const k of keys) payload[k] = config[k] || ""
            const res = await fetch("/api/admin/site-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                setMessage({ type: "success", text: "Saved successfully" })
                setConfigDirty((prev) => {
                    const next = new Set(prev)
                    for (const k of keys) next.delete(k)
                    return next
                })
            } else {
                setMessage({ type: "error", text: "Failed to save" })
            }
        } finally {
            setSaving(false)
        }
    }

    const loading = sponsorLoading || configLoading

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...
            </div>
        )
    }

    /* ── Tab definitions ── */
    const tabs: { id: typeof activeTab; icon: string; label: string; description: string }[] = [
        { id: "sponsors", icon: "mdi:handshake-outline", label: "Service Providers", description: "Logos & links shown in the footer" },
        { id: "filing", icon: "mdi:file-certificate-outline", label: "ICP / Filing", description: "ICP & public-security filing numbers" },
        { id: "visitor", icon: "mdi:counter", label: "Visitor Counter", description: "External visitor counter image" },
    ]

    /* ── config field groups ── */
    const filingKeys = ["footer_icp", "footer_icp_url", "footer_gongan", "footer_gongan_url"]
    const visitorKeys = ["footer_visitor_counter_url"]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-bold text-foreground">Footer Settings</h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Manage the three independent sections that appear in the page footer.
                </p>
            </div>

            {/* Toast message */}
            {message && (
                <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                        message.type === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                >
                    <Icon
                        icon={message.type === "success" ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}
                        className="mr-2 inline h-4 w-4"
                    />
                    {message.text}
                </div>
            )}

            {/* Tab bar */}
            <div className="flex gap-2 rounded-xl border border-border bg-muted/30 p-1">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                            activeTab === t.id
                                ? "bg-background text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Icon icon={t.icon} className="h-4 w-4" />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Section description */}
            <p className="text-[11px] text-muted-foreground">
                {tabs.find((t) => t.id === activeTab)?.description}
            </p>

            {/* ── Tab: Sponsors ── */}
            {activeTab === "sponsors" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-end">
                        <AdminButton onClick={() => { setEditing(null); setShowForm(true) }}>
                            <Icon icon="mdi:plus" className="h-4 w-4" /> Add Sponsor
                        </AdminButton>
                    </div>

                    {showForm && (
                        <SponsorForm
                            initial={editing}
                            onSave={handleSaveSponsor}
                            onCancel={() => { setShowForm(false); setEditing(null) }}
                        />
                    )}

                    {sponsors.length === 0 && !showForm && (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                            No sponsors yet. Add one to display in the footer.
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {sponsors.map((s) => (
                            <div
                                key={s.id}
                                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {s.logo && (
                                        s.logo.startsWith("http") || s.logo.startsWith("/") ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={s.logo} alt={s.name} className="h-5 w-5 shrink-0 object-contain" />
                                        ) : (
                                            <Icon icon={s.logo} className="h-5 w-5 shrink-0 text-muted-foreground" />
                                        )
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-foreground truncate">{s.name}</h3>
                                        <p className="font-mono text-[10px] text-muted-foreground truncate">{s.url || "no link"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-mono text-secondary-foreground">
                                        #{s.sort_order}
                                    </span>
                                    <button
                                        onClick={() => { setEditing(s); setShowForm(true) }}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                    >
                                        <Icon icon="mdi:pencil-outline" className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => s.id && handleDeleteSponsor(s.id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                                    >
                                        <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tab: ICP / Filing ── */}
            {activeTab === "filing" && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputField
                            label="ICP Filing Number"
                            value={config["footer_icp"] || ""}
                            onChange={(v) => handleConfigChange("footer_icp", v)}
                            placeholder="e.g. 京ICP备XXXXXXXX号"
                        />
                        <InputField
                            label="ICP Filing Link"
                            value={config["footer_icp_url"] || ""}
                            onChange={(v) => handleConfigChange("footer_icp_url", v)}
                            type="url"
                            placeholder="https://beian.miit.gov.cn/"
                        />
                        <InputField
                            label="Public Security Filing Number"
                            value={config["footer_gongan"] || ""}
                            onChange={(v) => handleConfigChange("footer_gongan", v)}
                            placeholder="e.g. 京公网安备XXXXX号"
                        />
                        <InputField
                            label="Public Security Filing Link"
                            value={config["footer_gongan_url"] || ""}
                            onChange={(v) => handleConfigChange("footer_gongan_url", v)}
                            type="url"
                            placeholder="http://www.beian.gov.cn/"
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        <AdminButton onClick={() => handleSaveConfig(filingKeys)} disabled={saving}>
                            <Icon icon={saving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                            Save Filing Info
                        </AdminButton>
                        {filingKeys.some((k) => configDirty.has(k)) && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-500">unsaved</span>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tab: Visitor Counter ── */}
            {activeTab === "visitor" && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <InputField
                        label="Visitor Counter Image URL"
                        value={config["footer_visitor_counter_url"] || ""}
                        onChange={(v) => handleConfigChange("footer_visitor_counter_url", v)}
                        type="url"
                        placeholder="https://count.kjchmc.cn/get/@kjch-home?theme=minecraft"
                    />
                    {config["footer_visitor_counter_url"] && (
                        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-4">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Preview</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={config["footer_visitor_counter_url"]}
                                alt="visitor counter preview"
                                className="h-8"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        <AdminButton onClick={() => handleSaveConfig(visitorKeys)} disabled={saving}>
                            <Icon icon={saving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                            Save Visitor Counter
                        </AdminButton>
                        {visitorKeys.some((k) => configDirty.has(k)) && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-500">unsaved</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════
   Sponsor Form (unchanged logic, kept as sub-component)
   ══════════════════════════════════════════════════════════════ */
function SponsorForm({
    initial,
    onSave,
    onCancel,
}: {
    initial: FooterSponsor | null
    onSave: (d: FooterSponsor) => void
    onCancel: () => void
}) {
    const [form, setForm] = useState<FooterSponsor>(initial || { ...empty })
    const set = (key: keyof FooterSponsor, value: string | number) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    return (
        <div className="mb-6 rounded-xl border border-primary/20 bg-card p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
                {initial?.id ? "Edit Sponsor" : "New Sponsor"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                    label="Name *"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    required
                    placeholder="e.g. Cloudflare"
                />
                <div>
                    <InputField
                        label="Logo (Iconify icon or image URL)"
                        value={form.logo}
                        onChange={(v) => set("logo", v)}
                        placeholder="e.g. simple-icons:cloudflare or https://..."
                    />
                    {form.logo && !(form.logo.startsWith("http") || form.logo.startsWith("/")) && (
                        <div className="mt-1">
                            <IconPreview icon={form.logo} />
                        </div>
                    )}
                </div>
                <InputField
                    label="Link URL"
                    value={form.url}
                    onChange={(v) => set("url", v)}
                    type="url"
                    placeholder="https://www.cloudflare.com"
                />
                <InputField
                    label="Sort Order"
                    value={String(form.sort_order)}
                    onChange={(v) => set("sort_order", parseInt(v) || 0)}
                    type="text"
                    placeholder="0"
                />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <AdminButton onClick={() => onSave(form)}>
                    <Icon icon="mdi:content-save-outline" className="h-4 w-4" /> Save
                </AdminButton>
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-mono text-muted-foreground hover:border-foreground/20 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
