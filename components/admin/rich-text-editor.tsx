"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { Icon } from "@iconify/react"

const lowlight = createLowlight(common)

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
}

function EditorToolbar({ editor }: { editor: any }) {
    if (!editor) return null

    const toggleFormat = (format: string) => {
        switch (format) {
            case "bold":
                editor.chain().focus().toggleBold().run()
                break
            case "italic":
                editor.chain().focus().toggleItalic().run()
                break
            case "code":
                editor.chain().focus().toggleCode().run()
                break
            case "h1":
                editor.chain().focus().toggleHeading({ level: 1 }).run()
                break
            case "h2":
                editor.chain().focus().toggleHeading({ level: 2 }).run()
                break
            case "h3":
                editor.chain().focus().toggleHeading({ level: 3 }).run()
                break
            case "ul":
                editor.chain().focus().toggleBulletList().run()
                break
            case "ol":
                editor.chain().focus().toggleOrderedList().run()
                break
            case "quote":
                editor.chain().focus().toggleBlockquote().run()
                break
            case "code-block":
                editor.chain().focus().toggleCodeBlock().run()
                break
            case "link":
                const url = prompt("Enter URL:")
                if (url) {
                    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
                }
                break
            case "image":
                const imageUrl = prompt("Enter image URL:")
                if (imageUrl) {
                    editor.chain().focus().setImage({ src: imageUrl }).run()
                }
                break
            case "undo":
                editor.chain().focus().undo().run()
                break
            case "redo":
                editor.chain().focus().redo().run()
                break
        }
    }

    const isActive = (format: string) => {
        switch (format) {
            case "bold":
                return editor.isActive("bold")
            case "italic":
                return editor.isActive("italic")
            case "code":
                return editor.isActive("code")
            case "h1":
                return editor.isActive("heading", { level: 1 })
            case "h2":
                return editor.isActive("heading", { level: 2 })
            case "h3":
                return editor.isActive("heading", { level: 3 })
            case "ul":
                return editor.isActive("bulletList")
            case "ol":
                return editor.isActive("orderedList")
            case "quote":
                return editor.isActive("blockquote")
            case "code-block":
                return editor.isActive("codeBlock")
            default:
                return false
        }
    }

    const buttonClass = (active: boolean) =>
        `flex items-center justify-center h-8 w-8 rounded transition-colors ${active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`

    return (
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-secondary p-2 mb-2">
            {/* 文本格式 */}
            <button
                onClick={() => toggleFormat("h1")}
                className={buttonClass(isActive("h1"))}
                title="Heading 1"
            >
                <Icon icon="mdi:format-header-1" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("h2")}
                className={buttonClass(isActive("h2"))}
                title="Heading 2"
            >
                <Icon icon="mdi:format-header-2" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("h3")}
                className={buttonClass(isActive("h3"))}
                title="Heading 3"
            >
                <Icon icon="mdi:format-header-3" className="h-4 w-4" />
            </button>

            <div className="border-l border-border" />

            <button
                onClick={() => toggleFormat("bold")}
                className={buttonClass(isActive("bold"))}
                title="Bold"
            >
                <Icon icon="mdi:format-bold" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("italic")}
                className={buttonClass(isActive("italic"))}
                title="Italic"
            >
                <Icon icon="mdi:format-italic" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("code")}
                className={buttonClass(isActive("code"))}
                title="Inline Code"
            >
                <Icon icon="mdi:code-tags" className="h-4 w-4" />
            </button>

            <div className="border-l border-border" />

            <button
                onClick={() => toggleFormat("ul")}
                className={buttonClass(isActive("ul"))}
                title="Bullet List"
            >
                <Icon icon="mdi:format-list-bulleted" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("ol")}
                className={buttonClass(isActive("ol"))}
                title="Ordered List"
            >
                <Icon icon="mdi:format-list-numbered" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("quote")}
                className={buttonClass(isActive("quote"))}
                title="Quote"
            >
                <Icon icon="mdi:format-quote-open" className="h-4 w-4" />
            </button>

            <div className="border-l border-border" />

            <button
                onClick={() => toggleFormat("code-block")}
                className={buttonClass(isActive("code-block"))}
                title="Code Block"
            >
                <Icon icon="mdi:code-braces" className="h-4 w-4" />
            </button>

            <div className="border-l border-border" />

            <button
                onClick={() => toggleFormat("link")}
                className={buttonClass(isActive("link"))}
                title="Link"
            >
                <Icon icon="mdi:link" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("image")}
                className={buttonClass(false)}
                title="Image"
            >
                <Icon icon="mdi:image-plus" className="h-4 w-4" />
            </button>

            <div className="border-l border-border" />

            <button
                onClick={() => toggleFormat("undo")}
                className={buttonClass(false)}
                title="Undo"
            >
                <Icon icon="mdi:undo" className="h-4 w-4" />
            </button>
            <button
                onClick={() => toggleFormat("redo")}
                className={buttonClass(false)}
                title="Redo"
            >
                <Icon icon="mdi:redo" className="h-4 w-4" />
            </button>
        </div>
    )
}

export function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Image.configure({
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value || "<p></p>",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    return (
        <div className="space-y-2">
            {label && <label className="text-xs font-bold text-foreground">{label}</label>}
            <EditorToolbar editor={editor} />
            <div className="rounded-lg border border-border bg-background overflow-hidden">
                <EditorContent
                    editor={editor}
                    className="prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none"
                    style={{
                        minHeight: "300px",
                    }}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                支持标题、加粗、斜体、列表、代码块、链接和图片
            </p>
        </div>
    )
}
