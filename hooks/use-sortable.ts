"use client"

import { useState, useRef, useCallback } from "react"

export interface SortableItem {
    id: string | number
    sort_order: number
}

export interface UseSortableOptions<T extends SortableItem> {
    /** All items from server */
    items: T[]
    /** API endpoint for saving items */
    apiEndpoint: string
    /** Callback to refresh items after save */
    onRefresh: () => void | Promise<void>
    /**
     * Optional filter: only items passing this predicate enter sort mode.
     * E.g. for contact: `item => !!item.visible`
     */
    filterForSort?: (item: T) => boolean
    /**
     * Optional transform before sending to API.
     * E.g. for projects: parse tags before POST.
     */
    transformBeforeSave?: (item: T) => Record<string, unknown>
}

export function useSortable<T extends SortableItem>(options: UseSortableOptions<T>) {
    const { items, apiEndpoint, onRefresh, filterForSort, transformBeforeSave } = options

    const [sortMode, setSortMode] = useState(false)
    const [sortItems, setSortItems] = useState<T[]>([])
    const [sortSaving, setSortSaving] = useState(false)
    const dragItem = useRef<number | null>(null)
    const dragOverItem = useRef<number | null>(null)

    const enterSortMode = useCallback(() => {
        const filtered = filterForSort ? items.filter(filterForSort) : items
        setSortItems(filtered.map((item, i) => ({ ...item, sort_order: item.sort_order ?? i })))
        setSortMode(true)
    }, [items, filterForSort])

    const cancelSortMode = useCallback(() => {
        setSortMode(false)
        setSortItems([])
    }, [])

    const handleDragStart = useCallback((index: number) => {
        dragItem.current = index
    }, [])

    const handleDragEnter = useCallback((index: number) => {
        dragOverItem.current = index
    }, [])

    const handleDragEnd = useCallback(() => {
        if (dragItem.current === null || dragOverItem.current === null) return
        const list = [...sortItems]
        const dragged = list[dragItem.current]
        list.splice(dragItem.current, 1)
        list.splice(dragOverItem.current, 0, dragged)
        setSortItems(list.map((item, i) => ({ ...item, sort_order: i })))
        dragItem.current = null
        dragOverItem.current = null
    }, [sortItems])

    const moveItem = useCallback((index: number, direction: -1 | 1) => {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= sortItems.length) return
        const list = [...sortItems]
            ;[list[index], list[newIndex]] = [list[newIndex], list[index]]
        setSortItems(list.map((item, i) => ({ ...item, sort_order: i })))
    }, [sortItems])

    const saveSortOrder = useCallback(async () => {
        setSortSaving(true)
        try {
            for (const item of sortItems) {
                const payload = transformBeforeSave
                    ? transformBeforeSave({ ...item, sort_order: item.sort_order })
                    : { ...item, sort_order: item.sort_order }
                await fetch(apiEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            }
            await onRefresh()
            setSortMode(false)
            setSortItems([])
        } finally {
            setSortSaving(false)
        }
    }, [sortItems, apiEndpoint, onRefresh, transformBeforeSave])

    return {
        sortMode,
        sortItems,
        sortSaving,
        enterSortMode,
        cancelSortMode,
        handleDragStart,
        handleDragEnter,
        handleDragEnd,
        moveItem,
        saveSortOrder,
    }
}
