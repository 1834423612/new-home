"use client"

import { useEffect, useState, useCallback } from "react"
import { Icon } from "@iconify/react"
import { InputField, TextAreaField, AdminButton } from "./form-fields"

interface ConfigGroup {
  id: string
  label: string
  icon: string
  description: string
  fields: ConfigField[]
}

interface ConfigField {
  key: string
  label: string
  type: "text" | "textarea" | "email" | "url"
  placeholder?: string
  description?: string
}

const configGroups: ConfigGroup[] = [
  {
    id: "hero",
    label: "Hero Section",
    icon: "mdi:home-outline",
    description: "Homepage hero area - greeting, name, subtitle",
    fields: [
      { key: "hero_greeting_zh", label: "Greeting (zh)", type: "text", placeholder: "e.g. 你好，我是" },
      { key: "hero_greeting_en", label: "Greeting (en)", type: "text", placeholder: "e.g. Hi, I'm" },
      { key: "hero_name_zh", label: "Name (zh)", type: "text", placeholder: "e.g. 况佳城" },
      { key: "hero_name_en", label: "Name (en)", type: "text", placeholder: "e.g. Kuang Jiacheng" },
      { key: "hero_alias", label: "Alias / Handle", type: "text", placeholder: "e.g. kjch" },
      { key: "hero_subtitle_zh", label: "Subtitle (zh)", type: "text", placeholder: "e.g. 热爱互联网..." },
      { key: "hero_subtitle_en", label: "Subtitle (en)", type: "text", placeholder: "e.g. Passionate about tech..." },
      { key: "hero_location_zh", label: "Location (zh)", type: "text", placeholder: "e.g. 美国俄亥俄州" },
      { key: "hero_location_en", label: "Location (en)", type: "text", placeholder: "e.g. Ohio, USA" },
    ],
  },
  {
    id: "about",
    label: "About Section",
    icon: "mdi:account-outline",
    description: "Personal info, bio, motto displayed on homepage",
    fields: [
      { key: "about_location_zh", label: "Location (zh)", type: "text" },
      { key: "about_location_en", label: "Location (en)", type: "text" },
      { key: "about_school_zh", label: "School (zh)", type: "text" },
      { key: "about_school_en", label: "School (en)", type: "text" },
      { key: "about_email", label: "Email", type: "email", placeholder: "admin@kjchmc.cn" },
      { key: "about_website", label: "Website", type: "url", placeholder: "www.kjchmc.cn" },
      { key: "about_badge", label: "Badge text", type: "text", placeholder: "makesome.cool" },
      { key: "about_motto_zh", label: "Motto line 1 (zh)", type: "text" },
      { key: "about_motto_en", label: "Motto line 1 (en)", type: "text" },
      { key: "about_motto2_zh", label: "Motto line 2 (zh)", type: "text" },
      { key: "about_motto2_en", label: "Motto line 2 (en)", type: "text" },
      { key: "about_bio_zh", label: "Bio paragraphs (zh, one per line)", type: "textarea", description: "Each line becomes a paragraph" },
      { key: "about_bio_en", label: "Bio paragraphs (en, one per line)", type: "textarea", description: "Each line becomes a paragraph" },
    ],
  },
  {
    id: "contact",
    label: "Contact Section",
    icon: "mdi:email-outline",
    description: "Contact page email and text",
    fields: [
      { key: "contact_email", label: "Contact Email", type: "email", placeholder: "admin@kjchmc.cn" },
      { key: "contact_subtitle_zh", label: "Contact subtitle (zh)", type: "text" },
      { key: "contact_subtitle_en", label: "Contact subtitle (en)", type: "text" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    icon: "mdi:page-layout-footer",
    description: "Footer text & credits (sponsors, filing & visitor counter are in Footer Settings)",
    fields: [
      { key: "footer_copyright_zh", label: "Copyright text (zh)", type: "text" },
      { key: "footer_copyright_en", label: "Copyright text (en)", type: "text" },
      { key: "footer_built_with_zh", label: "Built with text (zh)", type: "text" },
      { key: "footer_built_with_en", label: "Built with text (en)", type: "text" },
      { key: "footer_source_zh", label: "Footer quote (zh)", type: "text" },
      { key: "footer_source_en", label: "Footer quote (en)", type: "text" },
    ],
  },
  {
    id: "seo",
    label: "SEO & Meta",
    icon: "mdi:search-web",
    description: "Site title, description, keywords for search engines",
    fields: [
      { key: "site_title", label: "Site Title", type: "text", placeholder: "kjch - Personal Website" },
      { key: "site_description", label: "Site Description", type: "textarea" },
      { key: "site_keywords", label: "Keywords (comma-separated)", type: "text" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics (Umami)",
    icon: "mdi:chart-line",
    description: "Umami website analytics tracking — script URL and website ID",
    fields: [
      { key: "umami_script_url", label: "Umami Script URL", type: "url", placeholder: "https://tj.kjch.net/kjchtj_main.js", description: "The URL of your Umami tracking script" },
      { key: "umami_website_id", label: "Website ID", type: "text", placeholder: "9f297033-9cf3-46e7-8c24-39f8a8253227", description: "Your Umami website ID (UUID format)" },
      { key: "umami_domains", label: "Allowed Domains (optional)", type: "text", placeholder: "kjch.net,www.kjch.net", description: "Comma-separated list of domains to track (empty = all)" },
      { key: "umami_enabled", label: "Enable Tracking", type: "text", placeholder: "true", description: "Set to 'true' to enable, 'false' to disable" },
    ],
  },
]

export function SiteSettingsManager() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<string>("hero")
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/site-config")
      if (res.ok) setConfig(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setDirty((prev) => new Set(prev).add(key))
    setMessage(null)
  }

  const handleSaveGroup = async (group: ConfigGroup) => {
    setSaving(true)
    setMessage(null)
    try {
      const payload: Record<string, string> = {}
      for (const field of group.fields) {
        payload[field.key] = config[field.key] || ""
      }
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setMessage({ type: "success", text: `${group.label} saved successfully` })
        setDirty((prev) => {
          const next = new Set(prev)
          for (const f of group.fields) next.delete(f.key)
          return next
        })
      } else {
        setMessage({ type: "error", text: "Failed to save" })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading site settings...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Site Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure content displayed on the public website. Changes override local defaults.
        </p>
      </div>

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

      <div className="space-y-3">
        {configGroups.map((group) => {
          const isOpen = expandedGroup === group.id
          const hasChanges = group.fields.some((f) => dirty.has(f.key))

          return (
            <div
              key={group.id}
              className="rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/20"
            >
              <button
                type="button"
                onClick={() => setExpandedGroup(isOpen ? "" : group.id)}
                className="flex w-full items-center justify-between px-3 py-3 sm:px-5 sm:py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon icon={group.icon} className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{group.label}</span>
                      {hasChanges && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-500">
                          unsaved
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{group.description}</span>
                  </div>
                </div>
                <Icon
                  icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                  className="h-4 w-4 text-muted-foreground"
                />
              </button>

              {isOpen && (
                <div className="border-t border-border px-3 py-4 sm:px-5 sm:py-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.fields.map((field) =>
                      field.type === "textarea" ? (
                        <div key={field.key} className="sm:col-span-2">
                          <TextAreaField
                            label={field.label}
                            value={config[field.key] || ""}
                            onChange={(v) => handleChange(field.key, v)}
                            rows={4}
                          />
                          {field.description && (
                            <p className="mt-1 text-[10px] text-muted-foreground/60">{field.description}</p>
                          )}
                        </div>
                      ) : (
                        <div key={field.key}>
                          <InputField
                            label={field.label}
                            value={config[field.key] || ""}
                            onChange={(v) => handleChange(field.key, v)}
                            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                            placeholder={field.placeholder}
                          />
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <AdminButton onClick={() => handleSaveGroup(group)} disabled={saving}>
                      <Icon icon={saving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                      Save {group.label}
                    </AdminButton>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
