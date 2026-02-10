"use client"

import React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { InputField, AdminButton } from "./form-fields"
import { cn } from "@/lib/utils"

interface MediaFile {
  key: string
  size: number
  lastModified: string
  url: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function isImage(key: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)$/i.test(key)
}

const DEFAULT_ROOT = "kjch-site"
const STORAGE_KEY = "kjch-r2-root-path"

export function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [rootPath, setRootPath] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_ROOT
    }
    return DEFAULT_ROOT
  })
  const [editingRoot, setEditingRoot] = useState(false)
  const [tempRoot, setTempRoot] = useState(rootPath)
  const [folder, setFolder] = useState("uploads")
  const [customFolder, setCustomFolder] = useState("")
  const [showCustomFolder, setShowCustomFolder] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fullPrefix = rootPath ? `${rootPath}/${folder}` : folder

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media?prefix=${encodeURIComponent(fullPrefix)}`)
      if (res.ok) setFiles(await res.json())
    } finally {
      setLoading(false)
    }
  }, [fullPrefix])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const saveRootPath = () => {
    const cleaned = tempRoot.replace(/^\/+|\/+$/g, "")
    setRootPath(cleaned)
    localStorage.setItem(STORAGE_KEY, cleaned)
    setEditingRoot(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", fullPrefix)
        await fetch("/api/admin/media", { method: "POST", body: formData })
      }
      fetchFiles()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete ${key}?`)) return
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
    fetchFiles()
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const predefinedFolders = ["uploads", "projects", "awards", "avatars"]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Media Library</h2>
          <p className="text-xs text-muted-foreground mt-1">Upload and manage images via Cloudflare R2</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-l-lg transition-colors",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon icon="mdi:grid" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-r-lg transition-colors",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon icon="mdi:format-list-bulleted" className="h-4 w-4" />
            </button>
          </div>
          <AdminButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Icon
              icon={uploading ? "mdi:loading" : "mdi:cloud-upload-outline"}
              className={cn("h-4 w-4", uploading && "animate-spin")}
            />
            {uploading ? "Uploading..." : "Upload"}
          </AdminButton>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.svg"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* R2 Root Path Config */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:folder-cog-outline" className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">Root Path:</span>
            {editingRoot ? (
              <div className="flex items-center gap-2">
                <input
                  value={tempRoot}
                  onChange={(e) => setTempRoot(e.target.value)}
                  placeholder="e.g. kjch-site or my-project"
                  className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none w-48"
                />
                <button
                  onClick={saveRootPath}
                  className="rounded-md bg-primary px-2 py-1 text-[10px] font-mono text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingRoot(false)
                    setTempRoot(rootPath)
                  }}
                  className="rounded-md border border-border px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span className="rounded-md bg-secondary px-2 py-1 text-xs font-mono text-foreground">
                {rootPath || "(none)"}
              </span>
            )}
          </div>
          {!editingRoot && (
            <button
              onClick={() => {
                setTempRoot(rootPath)
                setEditingRoot(true)
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon icon="mdi:pencil-outline" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Full path: <span className="font-mono text-foreground/70">{fullPrefix}/</span>
          {" "}-- Multiple projects can share one R2 bucket using different root paths.
        </p>
      </div>

      {/* Folder selector */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Icon icon="mdi:folder-outline" className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">Folder:</span>
        {predefinedFolders.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFolder(f)
              setShowCustomFolder(false)
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-mono transition-all",
              folder === f && !showCustomFolder
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setShowCustomFolder(!showCustomFolder)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-mono transition-all border border-dashed",
            showCustomFolder
              ? "border-primary text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          )}
        >
          + custom
        </button>
        {showCustomFolder && (
          <div className="flex items-center gap-1">
            <input
              value={customFolder}
              onChange={(e) => setCustomFolder(e.target.value)}
              placeholder="folder-name"
              className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none w-32"
            />
            <button
              onClick={() => {
                if (customFolder.trim()) {
                  setFolder(customFolder.trim())
                }
              }}
              className="rounded-md bg-primary px-2 py-1 text-[10px] text-primary-foreground"
            >
              Go
            </button>
          </div>
        )}
      </div>

      {/* Files */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading files...
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
          <Icon icon="mdi:image-off-outline" className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No files in this folder</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Upload some files to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => (
            <div
              key={file.key}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40"
            >
              <div className="relative aspect-square bg-secondary">
                {isImage(file.key) ? (
                  <img
                    src={file.url || "/placeholder.svg"}
                    alt={file.key}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Icon icon="mdi:file-outline" className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleCopy(file.url)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-110"
                    title="Copy URL"
                  >
                    <Icon
                      icon={copiedUrl === file.url ? "mdi:check" : "mdi:content-copy"}
                      className="h-4 w-4"
                    />
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-transform hover:scale-110"
                    title="Open"
                  >
                    <Icon icon="mdi:open-in-new" className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground transition-transform hover:scale-110"
                    title="Delete"
                  >
                    <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-[10px] font-mono text-foreground">
                  {file.key.split("/").pop()}
                </p>
                <p className="text-[9px] text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div
              key={file.key}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                {isImage(file.key) ? (
                  <img src={file.url || "/placeholder.svg"} alt={file.key} className="h-full w-full object-cover" />
                ) : (
                  <Icon icon="mdi:file-outline" className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-mono text-foreground">{file.key}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatBytes(file.size)} / {new Date(file.lastModified).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(file.url)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  title="Copy URL"
                >
                  <Icon
                    icon={copiedUrl === file.url ? "mdi:check" : "mdi:content-copy"}
                    className="h-3.5 w-3.5"
                  />
                </button>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  title="Open"
                >
                  <Icon icon="mdi:open-in-new" className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(file.key)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Icon icon="mdi:delete-outline" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg bg-secondary/50 p-4">
        <p className="text-xs text-muted-foreground">
          <Icon icon="mdi:information-outline" className="mr-1 inline h-3.5 w-3.5" />
          Files are stored at: <span className="font-mono text-foreground/70">{fullPrefix}/</span>. Change the Root Path above to use this bucket for different projects.
        </p>
      </div>
    </div>
  )
}
