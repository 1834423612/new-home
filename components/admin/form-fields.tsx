"use client"

import React from "react"

import { Icon } from "@iconify/react"

export function InputField({
  label, value, onChange, required, disabled, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  required?: boolean; disabled?: boolean; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-mono text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none disabled:opacity-50 transition-colors"
      />
    </div>
  )
}

export function TextAreaField({
  label, value, onChange, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-mono text-muted-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors"
      />
    </div>
  )
}

export function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-mono text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function AdminButton({ children, onClick, variant = "primary", type = "button", disabled }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger"
  type?: "button" | "submit"; disabled?: boolean
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:shadow-[0_0_16px_hsl(var(--primary)/0.3)]",
    secondary: "border border-border text-muted-foreground hover:text-foreground",
    danger: "border border-border text-muted-foreground hover:border-destructive hover:text-destructive",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

export function IconPreview({ icon }: { icon: string }) {
  if (!icon) return null
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
      <span>Preview:</span>
      <Icon icon={icon} className="h-6 w-6" />
    </div>
  )
}
