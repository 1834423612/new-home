"use client"

import { useEditor, EditorContent, Node, mergeAttributes } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { Icon } from "@iconify/react"
import { useRef, useCallback, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const lowlight = createLowlight(common)
const DEFAULT_ROOT = "kjch-site"
const STORAGE_KEY = "kjch-r2-root-path"
const DEFAULT_EDITOR_FOLDER = "editor"

function normalizePath(value: string): string {
  return value.replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/")
}

// ─── Custom TipTap Node: Video (with poster support) ────────────────────
const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
    }
  },
  parseHTML() {
    return [{
      tag: 'div[data-type="video"]',
      getAttrs(dom) {
        const el = dom as HTMLElement
        return { src: el.getAttribute("data-src"), poster: el.getAttribute("data-poster") }
      },
    }]
  },
  renderHTML({ HTMLAttributes }) {
    const attrs: Record<string, string> = { "data-type": "video", "data-src": HTMLAttributes.src || "" }
    if (HTMLAttributes.poster) attrs["data-poster"] = HTMLAttributes.poster
    return ["div", mergeAttributes(HTMLAttributes, attrs)]
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.classList.add("video-node-view")
      dom.setAttribute("data-type", "video")
      dom.setAttribute("data-src", node.attrs.src || "")
      if (node.attrs.poster) dom.setAttribute("data-poster", node.attrs.poster)
      dom.contentEditable = "false"

      // If poster is set, show a thumbnail preview
      if (node.attrs.poster) {
        const thumb = document.createElement("div")
        thumb.className = "video-node-thumb"
        const img = document.createElement("img")
        img.src = node.attrs.poster
        img.alt = "Video thumbnail"
        img.className = "video-node-thumb-img"
        const overlay = document.createElement("span")
        overlay.className = "video-node-thumb-play"
        overlay.textContent = "\u25B6"
        thumb.appendChild(img)
        thumb.appendChild(overlay)
        dom.appendChild(thumb)
      } else {
        const icon = document.createElement("span")
        icon.textContent = "\u25B6"
        icon.className = "video-node-icon"
        dom.appendChild(icon)
      }

      const info = document.createElement("div")
      info.className = "video-node-info"

      const label = document.createElement("span")
      label.className = "video-node-label"
      label.textContent = node.attrs.poster ? "Video (with poster)" : "Video"
      info.appendChild(label)

      const url = document.createElement("span")
      url.className = "video-node-url"
      url.textContent = node.attrs.src || ""
      info.appendChild(url)

      dom.appendChild(info)

      return { dom }
    }
  },
})

// ─── Custom TipTap Node: Audio ──────────────────────────────────────────
const AudioNode = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="audio"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "audio", "data-src": HTMLAttributes.src })]
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.classList.add("audio-node-view")
      dom.setAttribute("data-type", "audio")
      dom.setAttribute("data-src", node.attrs.src || "")
      dom.contentEditable = "false"

      const icon = document.createElement("span")
      icon.textContent = "\u266B"
      icon.className = "audio-node-icon"
      dom.appendChild(icon)

      const info = document.createElement("div")
      info.className = "audio-node-info"

      const label = document.createElement("span")
      label.className = "audio-node-label"
      label.textContent = "Audio"
      info.appendChild(label)

      const url = document.createElement("span")
      url.className = "audio-node-url"
      url.textContent = node.attrs.src || ""
      info.appendChild(url)

      dom.appendChild(info)
      return { dom }
    }
  },
})

// ─── Types ──────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

type ToolbarItem =
  | { type: "button"; format: string; icon: string; label: string }
  | { type: "divider" }

type UploadTarget = "image" | "video" | "audio"

const toolbarGroups: ToolbarItem[][] = [
  [
    { type: "button", format: "h1", icon: "mdi:format-header-1", label: "Heading 1" },
    { type: "button", format: "h2", icon: "mdi:format-header-2", label: "Heading 2" },
    { type: "button", format: "h3", icon: "mdi:format-header-3", label: "Heading 3" },
  ],
  [
    { type: "button", format: "bold", icon: "mdi:format-bold", label: "Bold" },
    { type: "button", format: "italic", icon: "mdi:format-italic", label: "Italic" },
    { type: "button", format: "strike", icon: "mdi:format-strikethrough", label: "Strikethrough" },
    { type: "button", format: "code", icon: "mdi:code-tags", label: "Inline Code" },
  ],
  [
    { type: "button", format: "ul", icon: "mdi:format-list-bulleted", label: "Bullet List" },
    { type: "button", format: "ol", icon: "mdi:format-list-numbered", label: "Ordered List" },
    { type: "button", format: "quote", icon: "mdi:format-quote-open", label: "Blockquote" },
    { type: "button", format: "code-block", icon: "mdi:code-braces", label: "Code Block" },
  ],
  [
    { type: "button", format: "link", icon: "mdi:link", label: "Link" },
    { type: "button", format: "image", icon: "mdi:image-plus", label: "Image URL" },
    { type: "button", format: "upload-image", icon: "mdi:cloud-upload-outline", label: "Upload Image" },
    { type: "button", format: "hr", icon: "mdi:minus", label: "Horizontal Rule" },
  ],
  [
    { type: "button", format: "video-url", icon: "mdi:video-plus", label: "Video URL" },
    { type: "button", format: "upload-video", icon: "mdi:video-outline", label: "Upload Video" },
    { type: "button", format: "audio-url", icon: "mdi:music-note-plus", label: "Audio URL" },
    { type: "button", format: "upload-audio", icon: "mdi:file-music-outline", label: "Upload Audio" },
  ],
  [
    { type: "button", format: "undo", icon: "mdi:undo", label: "Undo" },
    { type: "button", format: "redo", icon: "mdi:redo", label: "Redo" },
  ],
]

// ─── Toolbar ────────────────────────────────────────────────────────────

function EditorToolbar({
  editor,
  onUpload,
}: {
  editor: ReturnType<typeof useEditor>
  onUpload: (target: UploadTarget) => void
}) {
  if (!editor) return null

  const exec = (format: string) => {
    switch (format) {
      case "bold": editor.chain().focus().toggleBold().run(); break
      case "italic": editor.chain().focus().toggleItalic().run(); break
      case "strike": editor.chain().focus().toggleStrike().run(); break
      case "code": editor.chain().focus().toggleCode().run(); break
      case "h1": editor.chain().focus().toggleHeading({ level: 1 }).run(); break
      case "h2": editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case "h3": editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case "ul": editor.chain().focus().toggleBulletList().run(); break
      case "ol": editor.chain().focus().toggleOrderedList().run(); break
      case "quote": editor.chain().focus().toggleBlockquote().run(); break
      case "code-block": editor.chain().focus().toggleCodeBlock().run(); break
      case "hr": editor.chain().focus().setHorizontalRule().run(); break
      case "link": {
        const prev = editor.getAttributes("link").href
        const url = prompt("Enter URL:", prev || "https://")
        if (url === null) return
        if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        break
      }
      case "image": {
        const imageUrl = prompt("Enter image URL:")
        if (imageUrl) editor.chain().focus().setImage({ src: imageUrl }).run()
        break
      }
      case "upload-image": onUpload("image"); break
      case "video-url": {
        const videoUrl = prompt("Enter video URL (YouTube, Bilibili, Vimeo, or direct file URL):")
        if (!videoUrl) return
        const posterUrl = prompt("(Optional) Enter poster/thumbnail URL for this video:\n\nLeave empty to use default.", "")
        editor.chain().focus().insertContent({
          type: "video",
          attrs: { src: videoUrl, poster: posterUrl || null },
        }).run()
        break
      }
      case "upload-video": onUpload("video"); break
      case "audio-url": {
        const audioUrl = prompt("Enter audio URL (SoundCloud, or direct MP3/WAV URL):")
        if (audioUrl) editor.chain().focus().insertContent({ type: "audio", attrs: { src: audioUrl } }).run()
        break
      }
      case "upload-audio": onUpload("audio"); break
      case "undo": editor.chain().focus().undo().run(); break
      case "redo": editor.chain().focus().redo().run(); break
    }
  }

  const isActive = (format: string): boolean => {
    switch (format) {
      case "bold": return editor.isActive("bold")
      case "italic": return editor.isActive("italic")
      case "strike": return editor.isActive("strike")
      case "code": return editor.isActive("code")
      case "h1": return editor.isActive("heading", { level: 1 })
      case "h2": return editor.isActive("heading", { level: 2 })
      case "h3": return editor.isActive("heading", { level: 3 })
      case "ul": return editor.isActive("bulletList")
      case "ol": return editor.isActive("orderedList")
      case "quote": return editor.isActive("blockquote")
      case "code-block": return editor.isActive("codeBlock")
      case "link": return editor.isActive("link")
      default: return false
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-border bg-secondary/60 px-2 py-1.5 backdrop-blur-sm">
      {toolbarGroups.map((group, gi) => (
        <div key={gi} className="flex items-center">
          {gi > 0 && <div className="mx-1 h-5 w-px bg-border/60" />}
          {group.map((item) => {
            if (item.type === "divider") return null
            const active = isActive(item.format)
            return (
              <button
                key={item.format}
                type="button"
                onClick={() => exec(item.format)}
                title={item.label}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Icon icon={item.icon} className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Main Editor ────────────────────────────────────────────────────────

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<UploadTarget>("image")
  const [rootPath, setRootPath] = useState(DEFAULT_ROOT)
  const [uploadFolder, setUploadFolder] = useState(DEFAULT_EDITOR_FOLDER)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setRootPath(normalizePath(stored) || DEFAULT_ROOT)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setRootPath(normalizePath(event.newValue || "") || DEFAULT_ROOT)
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const cleanedFolder = normalizePath(uploadFolder) || DEFAULT_EDITOR_FOLDER
  const fullPrefix = rootPath ? `${rootPath}/${cleanedFolder}` : cleanedFolder

  const acceptMap: Record<UploadTarget, string> = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ allowBase64: true, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      VideoNode,
      AudioNode,
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[280px] px-5 py-4",
      },
    },
  })

  const handleUpload = useCallback((target: UploadTarget) => {
    setUploadTarget(target)
    setTimeout(() => { fileInputRef.current?.click() }, 0)
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", fullPrefix)
      const res = await fetch("/api/admin/media", { method: "POST", body: formData })
      if (res.ok) {
        const { url } = await res.json()
        if (uploadTarget === "image") {
          editor.chain().focus().setImage({ src: url }).run()
        } else if (uploadTarget === "video") {
          // After uploading video, ask for optional poster
          const posterUrl = prompt("(Optional) Enter poster/thumbnail URL for this video:\n\nLeave empty to use default.", "")
          editor.chain().focus().insertContent({
            type: "video",
            attrs: { src: url, poster: posterUrl || null },
          }).run()
        } else if (uploadTarget === "audio") {
          editor.chain().focus().insertContent({ type: "audio", attrs: { src: url } }).run()
        }
      } else {
        alert("Upload failed")
      }
    } catch {
      alert("Upload error")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [editor, fullPrefix, uploadTarget])

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-2 text-xs font-bold text-foreground">
          {label}
          {uploading && (
            <span className="flex items-center gap-1 text-[10px] font-normal text-primary">
              <Icon icon="mdi:loading" className="h-3 w-3 animate-spin" /> Uploading...
            </span>
          )}
        </label>
      )}
      <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
        <span>Upload path: <span className="font-mono text-foreground/70">{fullPrefix}/</span></span>
        <label className="flex items-center gap-2">
          Folder
          <input
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            onBlur={(e) => setUploadFolder(normalizePath(e.target.value) || DEFAULT_EDITOR_FOLDER)}
            placeholder="editor or projects/2026"
            className="h-6 w-40 rounded-md border border-border bg-secondary px-2 text-[10px] text-foreground focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/50">
        <EditorToolbar editor={editor} onUpload={handleUpload} />
        <EditorContent editor={editor} />
        {editor && (
          <BubbleMenu editor={editor} options={{ tippyOptions: { duration: 150 } }} className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-xl">
            {(["bold", "italic", "strike", "code", "link"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => {
                  if (fmt === "link") {
                    const prev = editor.getAttributes("link").href
                    const url = prompt("URL:", prev || "https://")
                    if (url === null) return
                    if (url === "") { editor.chain().focus().unsetLink().run(); return }
                    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
                  } else {
                    editor.chain().focus()[`toggle${fmt.charAt(0).toUpperCase() + fmt.slice(1)}` as 'toggleBold']().run()
                  }
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors",
                  editor.isActive(fmt) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon icon={`mdi:format-${fmt === "code" ? "code" : fmt === "strike" ? "strikethrough" : fmt === "link" ? "link" : fmt}`} className="h-3.5 w-3.5" />
              </button>
            ))}
          </BubbleMenu>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptMap[uploadTarget]}
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-[10px] text-muted-foreground/60 px-1">
        Supports headings, bold, italic, lists, code blocks, links, images, video (YouTube/Bilibili/upload), and audio (SoundCloud/upload).
      </p>
    </div>
  )
}
