"use client"

import React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Icon } from "@iconify/react"
import { AdminButton } from "./form-fields"
import { cn } from "@/lib/utils"

interface MediaFile {
  key: string
  size: number
  lastModified: string
  url: string
}

interface FolderEntry {
  name: string
  prefix: string
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

function isVideo(key: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(key)
}

function isAudio(key: string): boolean {
  return /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(key)
}

function isPdf(key: string): boolean {
  return /\.pdf$/i.test(key)
}

function isArchive(key: string): boolean {
  return /\.(zip|rar|7z|tar|gz|bz2)$/i.test(key)
}

function isCode(key: string): boolean {
  return /\.(js|ts|jsx|tsx|json|html|css|md|py|java|cpp|c|go|rs)$/i.test(key)
}

function getFileIcon(key: string): string {
  if (isImage(key)) return "mdi:file-image-outline"
  if (isVideo(key)) return "mdi:file-video-outline"
  if (isAudio(key)) return "mdi:file-music-outline"
  if (isPdf(key)) return "mdi:file-pdf-box"
  if (isArchive(key)) return "mdi:folder-zip-outline"
  if (isCode(key)) return "mdi:file-code-outline"
  return "mdi:file-outline"
}

function getFileIconColor(key: string): string {
  if (isImage(key)) return "text-blue-500"
  if (isVideo(key)) return "text-purple-500"
  if (isAudio(key)) return "text-pink-500"
  if (isPdf(key)) return "text-red-500"
  if (isArchive(key)) return "text-amber-500"
  if (isCode(key)) return "text-emerald-500"
  return "text-muted-foreground"
}

function getFileName(key: string): string {
  return key.split("/").pop() || key
}

function getFileExt(key: string): string {
  const parts = key.split(".")
  return parts.length > 1 ? parts.pop()!.toUpperCase() : ""
}

const DEFAULT_ROOT = "kjch-site"
const STORAGE_KEY = "kjch-r2-root-path"
const MAX_SIZE_KEY = "kjch-r2-max-file-size-mb"
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks
const DEFAULT_MAX_SIZE_MB = 25

const SUGGESTED_FOLDERS = ["uploads", "projects", "awards", "avatars", "videos", "documents"]

export function MediaManager() {
  // State
  const [folders, setFolders] = useState<FolderEntry[]>([])
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [rootPath, setRootPath] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem(STORAGE_KEY) || DEFAULT_ROOT
    return DEFAULT_ROOT
  })
  const [editingRoot, setEditingRoot] = useState(false)
  const [tempRoot, setTempRoot] = useState(rootPath)
  const [currentPath, setCurrentPath] = useState<string[]>([]) // path segments after root
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(MAX_SIZE_KEY)
      return saved ? parseInt(saved) : DEFAULT_MAX_SIZE_MB
    }
    return DEFAULT_MAX_SIZE_MB
  })
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Computed
  const fullPrefix = [rootPath, ...currentPath].filter(Boolean).join("/")
  const breadcrumbs = [rootPath, ...currentPath]

  // Fetch folder contents
  const fetchFolder = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media?prefix=${encodeURIComponent(fullPrefix)}&mode=folder`)
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
        setFiles(data.files || [])
      }
    } finally {
      setLoading(false)
    }
  }, [fullPrefix])

  useEffect(() => { fetchFolder() }, [fetchFolder])

  // Navigation
  const navigateTo = (folderName: string) => {
    setCurrentPath(prev => [...prev, folderName])
  }

  const navigateToBreadcrumb = (index: number) => {
    // index 0 = root, index 1 = first subfolder, etc.
    setCurrentPath(prev => prev.slice(0, index))
  }

  const goUp = () => {
    setCurrentPath(prev => prev.slice(0, -1))
  }

  // Root path
  const saveRootPath = () => {
    const cleaned = tempRoot.replace(/^\/+|\/+$/g, "")
    setRootPath(cleaned)
    localStorage.setItem(STORAGE_KEY, cleaned)
    setEditingRoot(false)
    setCurrentPath([])
  }

  // Upload
  const uploadFiles = async (fileList: FileList | File[]) => {
    const filesToUpload = Array.from(fileList)
    if (!filesToUpload.length) return

    setUploading(true)
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        setUploadProgress(`${i + 1}/${filesToUpload.length}: ${file.name}`)

        if (file.size > maxFileSizeMB * 1024 * 1024) {
          // Chunked upload for large files
          await uploadChunked(file)
        } else {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("folder", fullPrefix)
          await fetch("/api/admin/media", { method: "POST", body: formData })
        }
      }
      fetchFolder()
    } finally {
      setUploading(false)
      setUploadProgress("")
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const uploadChunked = async (file: File) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    const chunks: string[] = []

    for (let i = 0; i < totalChunks; i++) {
      setUploadProgress(`Chunking ${file.name}: ${i + 1}/${totalChunks}`)
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const slice = file.slice(start, end)
      const buffer = await slice.arrayBuffer()
      chunks.push(btoa(String.fromCharCode(...new Uint8Array(buffer))))
    }

    setUploadProgress(`Uploading ${file.name}...`)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const key = `${fullPrefix}/${Date.now()}-${safeName}`
    await fetch("/api/admin/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, chunks, contentType: file.type }),
    })
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files)
  }

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  // Delete
  const handleDelete = async (key: string) => {
    if (!confirm(`Delete ${getFileName(key)}?`)) return
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
    fetchFolder()
  }

  // Copy
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Create folder (upload a placeholder)
  const createFolder = async () => {
    const name = newFolderName.trim().replace(/[^a-zA-Z0-9._-]/g, "_")
    if (!name) return
    // Upload a .folder marker file
    const key = `${fullPrefix}/${name}/.folder`
    const blob = new Blob([""], { type: "text/plain" })
    const formData = new FormData()
    formData.append("file", new File([blob], ".folder", { type: "text/plain" }))
    formData.append("folder", `${fullPrefix}/${name}`)
    await fetch("/api/admin/media", { method: "POST", body: formData })
    setNewFolderName("")
    setShowNewFolder(false)
    fetchFolder()
  }

  // Settings
  const saveMaxSize = (mb: number) => {
    setMaxFileSizeMB(mb)
    localStorage.setItem(MAX_SIZE_KEY, String(mb))
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Icon icon="mdi:cloud-upload-outline" className="h-12 w-12 text-primary animate-bounce" />
            <p className="text-sm font-bold text-primary">Drop files here to upload</p>
            <p className="text-xs text-muted-foreground">to {fullPrefix}/</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Media Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {folders.length} folder{folders.length !== 1 ? "s" : ""}, {files.length} file{files.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-l-lg transition-colors",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid view"
            >
              <Icon icon="mdi:view-grid-outline" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-r-lg transition-colors",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="List view"
            >
              <Icon icon="mdi:view-list-outline" className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            <Icon icon="mdi:cog-outline" className="h-4 w-4" />
          </button>
          <AdminButton variant="secondary" onClick={() => setShowNewFolder(true)}>
            <Icon icon="mdi:folder-plus-outline" className="h-4 w-4" /> New Folder
          </AdminButton>
          <AdminButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Icon icon={uploading ? "mdi:loading" : "mdi:cloud-upload-outline"} className={cn("h-4 w-4", uploading && "animate-spin")} />
            {uploading ? "Uploading..." : "Upload"}
          </AdminButton>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* Upload progress */}
      {uploading && uploadProgress && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs text-primary font-mono flex items-center gap-2">
          <Icon icon="mdi:loading" className="h-3.5 w-3.5 animate-spin" /> {uploadProgress}
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Icon icon="mdi:cog-outline" className="h-4 w-4 text-primary" /> Settings
          </h3>
          {/* Root path */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-mono text-muted-foreground shrink-0">Root Path:</span>
            {editingRoot ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={tempRoot}
                  onChange={(e) => setTempRoot(e.target.value)}
                  placeholder="e.g. kjch-site"
                  className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none w-48"
                />
                <button onClick={saveRootPath} className="rounded-md bg-primary px-2 py-1 text-[10px] font-mono text-primary-foreground hover:opacity-90">Save</button>
                <button onClick={() => { setEditingRoot(false); setTempRoot(rootPath) }} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-mono text-foreground">{rootPath || "(none)"}</span>
                <button onClick={() => { setTempRoot(rootPath); setEditingRoot(true) }} className="text-muted-foreground hover:text-primary transition-colors">
                  <Icon icon="mdi:pencil-outline" className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          {/* Max file size */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-mono text-muted-foreground shrink-0">Max single file (direct upload):</span>
            <div className="flex items-center gap-2">
              <select
                value={maxFileSizeMB}
                onChange={e => saveMaxSize(Number(e.target.value))}
                className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
              >
                {[5, 10, 25, 50, 100, 200, 500].map(v => <option key={v} value={v}>{v} MB</option>)}
              </select>
              <span className="text-[10px] text-muted-foreground">Files above this size use chunked upload ({(CHUNK_SIZE / 1024 / 1024)}MB chunks)</span>
            </div>
          </div>
        </div>
      )}

      {/* New folder dialog */}
      {showNewFolder && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-card p-4">
          <h3 className="mb-2 text-sm font-bold text-foreground">New Folder</h3>
          <p className="mb-3 text-[10px] text-muted-foreground">Creates at: {fullPrefix}/<span className="text-foreground">{newFolderName || "..."}</span>/</p>
          <div className="flex items-center gap-2">
            <input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="folder-name"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowNewFolder(false) }}
            />
            <AdminButton onClick={createFolder} disabled={!newFolderName.trim()}>Create</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowNewFolder(false); setNewFolderName("") }}>Cancel</AdminButton>
          </div>
          {/* Suggested folders */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-muted-foreground mr-1">Suggested:</span>
            {SUGGESTED_FOLDERS.map(f => (
              <button
                key={f}
                onClick={() => setNewFolderName(f)}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb navigation */}
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 overflow-x-auto">
        <button
          onClick={() => setCurrentPath([])}
          className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          <Icon icon="mdi:home-outline" className="h-3.5 w-3.5" />
          {rootPath}
        </button>
        {currentPath.map((segment, i) => (
          <React.Fragment key={i}>
            <Icon icon="mdi:chevron-right" className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <button
              onClick={() => navigateToBreadcrumb(i + 1)}
              className={cn(
                "text-xs font-mono shrink-0 transition-colors",
                i === currentPath.length - 1 ? "text-foreground font-bold" : "text-muted-foreground hover:text-primary"
              )}
            >
              {segment}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-sm text-muted-foreground">
          <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : folders.length === 0 && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
          <Icon icon="mdi:folder-open-outline" className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Empty folder</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Drag files here or click Upload</p>
          {currentPath.length > 0 && (
            <button onClick={goUp} className="mt-4 flex items-center gap-1 text-xs text-primary hover:underline">
              <Icon icon="mdi:arrow-up" className="h-3.5 w-3.5" /> Go back
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div>
          {/* Folders - grid */}
          {folders.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Folders ({folders.length})</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {currentPath.length > 0 && (
                  <button
                    onClick={goUp}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <Icon icon="mdi:folder-arrow-up-outline" className="h-10 w-10 text-muted-foreground" />
                    <span className="text-[11px] font-mono text-muted-foreground">..</span>
                  </button>
                )}
                {folders.map((f) => (
                  <button
                    key={f.prefix}
                    onClick={() => navigateTo(f.name)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm group"
                  >
                    <Icon icon="mdi:folder" className="h-10 w-10 text-amber-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-[11px] font-mono text-foreground truncate max-w-full" title={f.name}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files - grid */}
          {files.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Files ({files.length})</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {files.map((file) => {
                  const name = getFileName(file.key)
                  const ext = getFileExt(file.key)
                  return (
                    <div
                      key={file.key}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40"
                    >
                      <div className="relative aspect-square bg-secondary/50">
                        {isImage(file.key) ? (
                          <img src={file.url} alt={name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1">
                            <Icon icon={getFileIcon(file.key)} className={cn("h-10 w-10", getFileIconColor(file.key))} />
                            {ext && <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-mono font-bold text-muted-foreground">{ext}</span>}
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleCopy(file.url)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-110"
                            title="Copy URL"
                          >
                            <Icon icon={copiedUrl === file.url ? "mdi:check" : "mdi:content-copy"} className="h-4 w-4" />
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
                        <p className="truncate text-[10px] font-mono text-foreground" title={name}>{name}</p>
                        <p className="text-[9px] text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Folders - list */}
          {folders.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">Folders ({folders.length})</h3>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {currentPath.length > 0 && (
                  <button
                    onClick={goUp}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <Icon icon="mdi:folder-arrow-up-outline" className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground">..</span>
                  </button>
                )}
                {folders.map((f) => (
                  <button
                    key={f.prefix}
                    onClick={() => navigateTo(f.name)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/30 transition-colors group"
                  >
                    <Icon icon="mdi:folder" className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="text-xs font-mono text-foreground truncate">{f.name}</span>
                    <Icon icon="mdi:chevron-right" className="ml-auto h-4 w-4 text-muted-foreground/40 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files - list */}
          {files.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">Files ({files.length})</h3>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {files.map((file) => {
                  const name = getFileName(file.key)
                  return (
                    <div
                      key={file.key}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/70">
                        {isImage(file.key) ? (
                          <img src={file.url} alt={name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <Icon icon={getFileIcon(file.key)} className={cn("h-5 w-5", getFileIconColor(file.key))} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-mono text-foreground">{name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatBytes(file.size)} · {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(file.url)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Copy URL"
                        >
                          <Icon icon={copiedUrl === file.url ? "mdi:check" : "mdi:content-copy"} className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Open"
                        >
                          <Icon icon="mdi:open-in-new" className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.key)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Icon icon="mdi:delete-outline" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer info */}
      <div className="mt-6 rounded-lg bg-secondary/50 p-3">
        <p className="text-[10px] text-muted-foreground">
          <Icon icon="mdi:information-outline" className="mr-1 inline h-3 w-3" />
          Current path: <span className="font-mono text-foreground/70">{fullPrefix}/</span>
          {" · "}Max direct upload: {maxFileSizeMB}MB
          {" · "}Files over {maxFileSizeMB}MB use {CHUNK_SIZE / 1024 / 1024}MB chunked upload
          {" · "}Drag &amp; drop files anywhere to upload
        </p>
      </div>
    </div>
  )
}
