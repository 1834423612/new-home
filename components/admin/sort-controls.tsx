"use client"

import React from "react"
import { Icon } from "@iconify/react"
import { AdminButton } from "./form-fields"
import { cn } from "@/lib/utils"
import type { SortableItem } from "@/hooks/use-sortable"

/* ── Sort toolbar buttons ── */
export function SortToolbar({
    sortMode,
    sortSaving,
    onEnterSort,
    onSaveSort,
    onCancelSort,
    children,
}: {
    sortMode: boolean
    sortSaving: boolean
    onEnterSort: () => void
    onSaveSort: () => void
    onCancelSort: () => void
    /** Extra buttons to show when NOT in sort mode (e.g. "Add" button) */
    children?: React.ReactNode
}) {
    if (sortMode) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <AdminButton onClick={onSaveSort} disabled={sortSaving}>
                    <Icon icon={sortSaving ? "mdi:loading" : "mdi:content-save-outline"} className={cn("h-4 w-4", sortSaving && "animate-spin")} />
                    {sortSaving ? "Saving..." : "Save Order"}
                </AdminButton>
                <AdminButton variant="secondary" onClick={onCancelSort} disabled={sortSaving}>Cancel</AdminButton>
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <AdminButton variant="secondary" onClick={onEnterSort}>
                <Icon icon="mdi:sort" className="h-4 w-4" /> Reorder
            </AdminButton>
            {children}
        </div>
    )
}

/* ── Sort list container ── */
export function SortList<T extends SortableItem>({
    items,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onMove,
    renderLabel,
}: {
    items: T[]
    onDragStart: (index: number) => void
    onDragEnter: (index: number) => void
    onDragEnd: () => void
    onMove: (index: number, direction: -1 | 1) => void
    /** Render the main content of each sort row */
    renderLabel: (item: T, index: number) => React.ReactNode
}) {
    return (
        <div className="space-y-1">
            <p className="mb-3 text-xs text-muted-foreground flex items-center gap-1">
                <Icon icon="mdi:information-outline" className="h-3.5 w-3.5" />
                Drag items or use arrows to reorder, then click &quot;Save Order&quot;
            </p>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragEnter={() => onDragEnter(index)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 sm:p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                >
                    <Icon icon="mdi:drag" className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                    <span className="flex h-6 min-w-[1.75rem] items-center justify-center rounded bg-primary/10 px-1.5 text-[10px] font-mono font-bold text-primary shrink-0">
                        #{index}
                    </span>
                    <div className="flex-1 min-w-0">
                        {renderLabel(item, index)}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onMove(index, -1)}
                            disabled={index === 0}
                            className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
                            title="Move up"
                        >
                            <Icon icon="mdi:arrow-up" className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onMove(index, 1)}
                            disabled={index === items.length - 1}
                            className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
                            title="Move down"
                        >
                            <Icon icon="mdi:arrow-down" className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ── Sort order badge for normal list view ── */
export function SortBadge({ order }: { order: number }) {
    return (
        <span className="flex h-5 min-w-[1.5rem] items-center justify-center rounded bg-secondary px-1 text-[9px] font-mono font-bold text-muted-foreground">
            #{order}
        </span>
    )
}
