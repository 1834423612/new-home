"use client"

import { useState, useCallback, type KeyboardEvent } from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

const TAG_COLORS = [
  { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/20", hover: "hover:bg-blue-500/25" },
  { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/25" },
  { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/20", hover: "hover:bg-amber-500/25" },
  { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-300", border: "border-purple-500/20", hover: "hover:bg-purple-500/25" },
  { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-300", border: "border-rose-500/20", hover: "hover:bg-rose-500/25" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-500/20", hover: "hover:bg-cyan-500/25" },
  { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500/20", hover: "hover:bg-orange-500/25" },
  { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-500/20", hover: "hover:bg-indigo-500/25" },
  { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-300", border: "border-teal-500/20", hover: "hover:bg-teal-500/25" },
  { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-300", border: "border-pink-500/20", hover: "hover:bg-pink-500/25" },
]

function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length]
}

interface TagInputProps {
  label?: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ label, tags, onChange, placeholder = "Type and press Enter or comma..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed])
      }
      setInputValue("")
    },
    [tags, onChange]
  )

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index))
    },
    [tags, onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (text.includes(",")) {
      e.preventDefault()
      const parts = text.split(",").map((s) => s.trim()).filter(Boolean)
      const unique = [...new Set([...tags, ...parts])]
      onChange(unique)
      setInputValue("")
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="mb-1.5 block text-xs font-mono text-muted-foreground">{label}</label>}
      <div
        className={cn(
          "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border bg-background px-3 py-2 transition-colors",
          isFocused ? "border-primary ring-1 ring-primary/20" : "border-border"
        )}
      >
        {tags.map((tag, i) => {
          const color = getTagColor(i)
          return (
            <span
              key={`${tag}-${i}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                color.bg,
                color.text,
                color.border
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className={cn("flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors", color.hover)}
                aria-label={`Remove ${tag}`}
              >
                <Icon icon="mdi:close" className="h-2.5 w-2.5" />
              </button>
            </span>
          )
        })}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            if (inputValue.trim()) addTag(inputValue)
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[100px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
      </div>
      <p className="text-[10px] text-muted-foreground/50 px-1">
        Press Enter or comma to add a tag. Backspace to remove last tag.
      </p>
    </div>
  )
}
