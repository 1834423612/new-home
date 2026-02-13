"use client"

import { useEditor, EditorContent, Node, mergeAttributes } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { TextAlign } from "@tiptap/extension-text-align"
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import { Highlight } from "@tiptap/extension-highlight"
import { Underline } from "@tiptap/extension-underline"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
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

// ─── Custom TipTap Extension: Resizable Image ──────────────────────────

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.width || element.getAttribute("width") || null,
        renderHTML: (attributes: Record<string, any>) => {
          const styles: string[] = []
          if (attributes.width) styles.push(`width: ${attributes.width}`)
          if (attributes.textAlign) styles.push(`display: block`)
          if (attributes.textAlign === "center") styles.push(`margin-left: auto`, `margin-right: auto`)
          else if (attributes.textAlign === "right") styles.push(`margin-left: auto`, `margin-right: 0`)
          else if (attributes.textAlign === "left") styles.push(`margin-left: 0`, `margin-right: auto`)
          return styles.length ? { style: styles.join("; ") } : {}
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          if (element.style.marginLeft === "auto" && element.style.marginRight === "auto") return "center"
          if (element.style.marginLeft === "auto" && element.style.marginRight === "0px") return "right"
          return null
        },
        renderHTML: () => ({}),  // handled by width renderHTML above
      },
    }
  },
})

const IMAGE_SIZE_PRESETS: { label: string; value: string | null }[] = [
  { label: "小 25%", value: "25%" },
  { label: "中 50%", value: "50%" },
  { label: "大 75%", value: "75%" },
  { label: "适合宽度", value: "100%" },
  { label: "原始大小", value: null },
]

// ─── Color Palettes ─────────────────────────────────────────────────────

const TEXT_COLORS = [
  { label: "默认", value: "" },
  { label: "灰色", value: "#6b7280" },
  { label: "红色", value: "#ef4444" },
  { label: "橙色", value: "#f97316" },
  { label: "琥珀", value: "#f59e0b" },
  { label: "绿色", value: "#22c55e" },
  { label: "青色", value: "#06b6d4" },
  { label: "蓝色", value: "#3b82f6" },
  { label: "紫色", value: "#8b5cf6" },
  { label: "粉色", value: "#ec4899" },
]

const HIGHLIGHT_COLORS = [
  { label: "无", value: "" },
  { label: "黄色", value: "#fef08a" },
  { label: "绿色", value: "#bbf7d0" },
  { label: "蓝色", value: "#bfdbfe" },
  { label: "紫色", value: "#e9d5ff" },
  { label: "粉色", value: "#fce7f3" },
  { label: "橙色", value: "#fed7aa" },
  { label: "青色", value: "#a5f3fc" },
  { label: "红色", value: "#fecaca" },
  { label: "灰色", value: "#e5e7eb" },
]

// ─── Color Picker Dropdown ──────────────────────────────────────────────

function ColorPickerDropdown({
  icon,
  title,
  colors,
  activeColor,
  onSelect,
  indicatorColor,
  popoverAlign = "left",
}: {
  icon: string
  title: string
  colors: { label: string; value: string }[]
  activeColor: string
  onSelect: (color: string) => void
  indicatorColor?: string
  popoverAlign?: "left" | "right"
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        setOpen(false)
      }
    }
    // Use click (not mousedown) so inner button clicks fire first
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        title={title}
        className={cn(
          "flex h-7 w-7 flex-col items-center justify-center rounded-md text-xs transition-all",
          activeColor
            ? "text-foreground hover:bg-background"
            : "text-muted-foreground hover:bg-background hover:text-foreground"
        )}
      >
        <Icon icon={icon} className="h-3.5 w-3.5" />
        <div
          className="mt-px h-[2px] w-3.5 rounded-full"
          style={{ backgroundColor: indicatorColor || activeColor || "currentColor" }}
        />
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1 rounded-lg border border-border bg-popover p-2 shadow-xl",
            popoverAlign === "right" ? "right-0" : "left-0"
          )}
          style={{ width: "fit-content" }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">{title}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 28px)", gap: "4px" }}>
            {colors.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                title={label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(value); setOpen(false) }}
                className={cn(
                  "flex items-center justify-center rounded-md border transition-all",
                  activeColor === value ? "border-primary ring-1 ring-primary" : "border-transparent hover:border-border",
                  !value && "bg-background"
                )}
                style={{ width: 28, height: 28 }}
              >
                {value ? (
                  <div className="rounded-sm" style={{ width: 18, height: 18, backgroundColor: value }} />
                ) : (
                  <Icon icon="mdi:format-color-reset" className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
    { type: "button", format: "bold", icon: "mdi:format-bold", label: "粗体" },
    { type: "button", format: "italic", icon: "mdi:format-italic", label: "斜体" },
    { type: "button", format: "underline", icon: "mdi:format-underline", label: "下划线" },
    { type: "button", format: "strike", icon: "mdi:format-strikethrough", label: "删除线" },
    { type: "button", format: "code", icon: "mdi:code-tags", label: "行内代码" },
    { type: "button", format: "subscript", icon: "mdi:format-subscript", label: "下标" },
    { type: "button", format: "superscript", icon: "mdi:format-superscript", label: "上标" },
  ],
  [
    { type: "button", format: "align-left", icon: "mdi:format-align-left", label: "左对齐" },
    { type: "button", format: "align-center", icon: "mdi:format-align-center", label: "居中" },
    { type: "button", format: "align-right", icon: "mdi:format-align-right", label: "右对齐" },
    { type: "button", format: "align-justify", icon: "mdi:format-align-justify", label: "两端对齐" },
  ],
  [
    { type: "button", format: "ul", icon: "mdi:format-list-bulleted", label: "无序列表" },
    { type: "button", format: "ol", icon: "mdi:format-list-numbered", label: "有序列表" },
    { type: "button", format: "quote", icon: "mdi:format-quote-open", label: "引用" },
    { type: "button", format: "code-block", icon: "mdi:code-braces", label: "代码块" },
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
    { type: "button", format: "undo", icon: "mdi:undo", label: "撤销" },
    { type: "button", format: "redo", icon: "mdi:redo", label: "重做" },
  ],
]

// ─── Toolbar ────────────────────────────────────────────────────────────

function EditorToolbar({
  editor,
  onUpload,
}: {
  editor: ReturnType<typeof useEditor> | null
  onUpload: (target: UploadTarget) => void
}) {
  if (!editor) return null

  const exec = (format: string) => {
    switch (format) {
      case "bold": editor.chain().focus().toggleBold().run(); break
      case "italic": editor.chain().focus().toggleItalic().run(); break
      case "underline": editor.chain().focus().toggleUnderline().run(); break
      case "strike": editor.chain().focus().toggleStrike().run(); break
      case "code": editor.chain().focus().toggleCode().run(); break
      case "subscript": editor.chain().focus().toggleSubscript().run(); break
      case "superscript": editor.chain().focus().toggleSuperscript().run(); break
      case "h1": editor.chain().focus().toggleHeading({ level: 1 }).run(); break
      case "h2": editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case "h3": editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case "align-left": editor.chain().focus().setTextAlign("left").run(); break
      case "align-center": editor.chain().focus().setTextAlign("center").run(); break
      case "align-right": editor.chain().focus().setTextAlign("right").run(); break
      case "align-justify": editor.chain().focus().setTextAlign("justify").run(); break
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
      case "underline": return editor.isActive("underline")
      case "strike": return editor.isActive("strike")
      case "code": return editor.isActive("code")
      case "subscript": return editor.isActive("subscript")
      case "superscript": return editor.isActive("superscript")
      case "h1": return editor.isActive("heading", { level: 1 })
      case "h2": return editor.isActive("heading", { level: 2 })
      case "h3": return editor.isActive("heading", { level: 3 })
      case "align-left": return editor.isActive({ textAlign: "left" })
      case "align-center": return editor.isActive({ textAlign: "center" })
      case "align-right": return editor.isActive({ textAlign: "right" })
      case "align-justify": return editor.isActive({ textAlign: "justify" })
      case "ul": return editor.isActive("bulletList")
      case "ol": return editor.isActive("orderedList")
      case "quote": return editor.isActive("blockquote")
      case "code-block": return editor.isActive("codeBlock")
      case "link": return editor.isActive("link")
      default: return false
    }
  }

  const currentTextColor = editor.getAttributes("textStyle").color || ""
  const currentHighlight = editor.getAttributes("highlight").color || ""

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
      {/* Color pickers */}
      <div className="mx-1 h-5 w-px bg-border/60" />
      <div className="flex items-center">
        <ColorPickerDropdown
          icon="mdi:format-color-text"
          title="文字颜色"
          colors={TEXT_COLORS}
          activeColor={currentTextColor}
          indicatorColor={currentTextColor || undefined}
          onSelect={(color) => {
            if (color) {
              editor.chain().focus().setColor(color).run()
            } else {
              editor.chain().focus().unsetColor().run()
            }
          }}
        />
        <ColorPickerDropdown
          icon="mdi:marker"
          title="高亮颜色"
          colors={HIGHLIGHT_COLORS}
          activeColor={currentHighlight}
          indicatorColor={currentHighlight || undefined}
          popoverAlign="right"
          onSelect={(color) => {
            if (color) {
              editor.chain().focus().toggleHighlight({ color }).run()
            } else {
              editor.chain().focus().unsetHighlight().run()
            }
          }}
        />
      </div>
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
      ResizableImage.configure({ allowBase64: true, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Subscript,
      Superscript,
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
          <BubbleMenu editor={editor} options={{ placement: 'top' }} className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-xl">
            {(["bold", "italic", "underline", "strike", "code", "link"] as const).map((fmt) => {
              const iconMap: Record<string, string> = {
                bold: "mdi:format-bold",
                italic: "mdi:format-italic",
                underline: "mdi:format-underline",
                strike: "mdi:format-strikethrough",
                code: "mdi:code-tags",
                link: "mdi:link",
              }
              return (
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
                  <Icon icon={iconMap[fmt]} className="h-3.5 w-3.5" />
                </button>
              )
            })}
            <div className="mx-0.5 h-5 w-px bg-border/60" />
            {HIGHLIGHT_COLORS.filter(c => c.value).slice(0, 6).map(({ label, value }) => (
              <button
                key={value}
                type="button"
                title={`高亮: ${label}`}
                onClick={() => editor.chain().focus().toggleHighlight({ color: value }).run()}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md border transition-all",
                  editor.isActive("highlight", { color: value })
                    ? "border-primary ring-1 ring-primary"
                    : "border-transparent hover:border-border"
                )}
              >
                <div className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: value }} />
              </button>
            ))}
          </BubbleMenu>
        )}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor: e }) => e.isActive('image')}
            options={{ placement: 'bottom' }}
            className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-xl"
          >
            {IMAGE_SIZE_PRESETS.map(({ label, value }) => {
              const currentWidth = editor.getAttributes('image').width
              const isActive = value ? currentWidth === value : !currentWidth
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().updateAttributes('image', { width: value }).run()
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 h-7 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              )
            })}
            <div className="mx-0.5 h-5 w-px bg-border/60" />
            <button
              type="button"
              onClick={() => {
                const currentWidth = editor.getAttributes('image').width
                const custom = prompt("输入自定义宽度 (例如: 300px, 60%):", currentWidth || "")
                if (custom !== null && custom.trim()) {
                  editor.chain().focus().updateAttributes('image', { width: custom.trim() }).run()
                }
              }}
              className="flex items-center gap-1 px-2 h-7 rounded-md text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors whitespace-nowrap"
            >
              <Icon icon="mdi:pencil-ruler" className="h-3.5 w-3.5" />
              自定义
            </button>
            <div className="mx-0.5 h-5 w-px bg-border/60" />
            {([
              { align: "left", icon: "mdi:format-align-left", label: "左对齐" },
              { align: "center", icon: "mdi:format-align-center", label: "居中" },
              { align: "right", icon: "mdi:format-align-right", label: "右对齐" },
            ] as const).map(({ align, icon, label }) => {
              const currentAlign = editor.getAttributes('image').textAlign
              const isAlignActive = align === "left" ? !currentAlign || currentAlign === "left" : currentAlign === align
              return (
                <button
                  key={align}
                  type="button"
                  title={label}
                  onClick={() => {
                    editor.chain().focus().updateAttributes('image', { textAlign: align === "left" ? null : align }).run()
                  }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors",
                    isAlignActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon icon={icon} className="h-3.5 w-3.5" />
                </button>
              )
            })}
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
