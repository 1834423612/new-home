"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { InputField } from "./form-fields"
import { Card } from "@/components/ui/card"

interface ProjectLink {
    id?: string
    title_zh: string
    title_en: string
    url: string
    icon?: string
}

interface LinksManagerProps {
    value: ProjectLink[]
    onChange: (links: ProjectLink[]) => void
}

export function LinksManager({ value, onChange }: LinksManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<ProjectLink>>({})

    const handleAdd = () => {
        setEditingId("new")
        setFormData({ title_zh: "", title_en: "", url: "", icon: "" })
    }

    const handleEdit = (link: ProjectLink) => {
        setEditingId(link.id || Math.random().toString())
        setFormData(link)
    }

    const handleSave = () => {
        if (!formData.title_zh || !formData.title_en || !formData.url) {
            alert("Please fill in all required fields (Chinese title, English title, and URL)")
            return
        }

        if (editingId === "new") {
            const newLink: ProjectLink = {
                id: Math.random().toString(),
                title_zh: formData.title_zh,
                title_en: formData.title_en,
                url: formData.url,
                icon: formData.icon || undefined,
            }
            onChange([...value, newLink])
        } else {
            onChange(
                value.map((link) =>
                    link.id === editingId || (editingId === "new" && !link.id)
                        ? {
                            ...link,
                            title_zh: formData.title_zh || link.title_zh,
                            title_en: formData.title_en || link.title_en,
                            url: formData.url || link.url,
                            icon: formData.icon || link.icon,
                        }
                        : link
                )
            )
        }

        setEditingId(null)
        setFormData({})
    }

    const handleDelete = (id: string | undefined) => {
        if (!id) return
        onChange(value.filter((link) => link.id !== id))
    }

    const handleCancel = () => {
        setEditingId(null)
        setFormData({})
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Related Links</h4>
                {editingId === null && (
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAdd}
                        className="h-8 px-3 text-xs"
                    >
                        <Icon icon="mdi:plus" className="h-3 w-3 mr-1" />
                        Add Link
                    </Button>
                )}
            </div>

            {/* 现有链接列表 */}
            {value.length > 0 && (
                <div className="grid gap-3">
                    {value.map((link) => (
                        <Card
                            key={link.id}
                            className={`p-3 transition-colors ${editingId === link.id ? "border-primary bg-primary/5" : ""
                                }`}
                        >
                            {editingId === link.id ? null : (
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">
                                            {link.title_en} / {link.title_zh}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate mt-1">{link.url}</p>
                                        {link.icon && (
                                            <p className="text-xs text-secondary-foreground mt-1 font-mono">
                                                Icon: {link.icon}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(link)}
                                            className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Icon icon="mdi:pencil-outline" className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Icon icon="mdi:delete-outline" className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* 编辑表单 */}
            {editingId !== null && (
                <Card className="p-4 border-primary/30 bg-card space-y-3">
                    <h5 className="text-xs font-bold text-foreground">
                        {editingId === "new" ? "Add New Link" : "Edit Link"}
                    </h5>

                    <div className="grid gap-3">
                        <InputField
                            label="Title (Chinese)"
                            value={formData.title_zh || ""}
                            onChange={(v) => setFormData({ ...formData, title_zh: v })}
                            placeholder="e.g., 项目文档"
                            required
                        />
                        <InputField
                            label="Title (English)"
                            value={formData.title_en || ""}
                            onChange={(v) => setFormData({ ...formData, title_en: v })}
                            placeholder="e.g., Documentation"
                            required
                        />
                        <InputField
                            label="URL"
                            value={formData.url || ""}
                            onChange={(v) => setFormData({ ...formData, url: v })}
                            placeholder="https://example.com"
                            required
                        />
                        <InputField
                            label="Icon (Iconify icon name, optional)"
                            value={formData.icon || ""}
                            onChange={(v) => setFormData({ ...formData, icon: v })}
                            placeholder="e.g., mdi:book-outline"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_10px_hsl(var(--primary)/0.3)] transition-all"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </Card>
            )}

            {value.length === 0 && editingId === null && (
                <p className="text-xs text-muted-foreground text-center py-4">No links yet</p>
            )}
        </div>
    )
}
