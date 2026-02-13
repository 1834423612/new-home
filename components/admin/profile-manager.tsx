"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { InputField, AdminButton } from "./form-fields"

export function ProfileManager() {
  const [username, setUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.username) {
          setUsername(data.username)
          setCreatedAt(data.created_at || "")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveUsername = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: "Username updated. Please re-login." })
      } else {
        setMessage({ type: "error", text: data.error || "Failed" })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed" })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" /> Loading profile...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage your admin account</p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
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

      {/* Account Info */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <Icon icon="mdi:account-outline" className="h-4 w-4 text-primary" />
          Account Information
        </h3>
        <div className="space-y-4">
          <InputField
            label="Username"
            value={username}
            onChange={setUsername}
          />
          {createdAt && (
            <p className="text-xs text-muted-foreground">
              Account created: {new Date(createdAt).toLocaleDateString()}
            </p>
          )}
          <AdminButton onClick={handleSaveUsername} disabled={saving}>
            <Icon icon={saving ? "mdi:loading" : "mdi:content-save-outline"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
            Save Username
          </AdminButton>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <Icon icon="mdi:lock-outline" className="h-4 w-4 text-primary" />
          Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <InputField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            type="password"
            required
          />
          <InputField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            type="password"
            required
          />
          <InputField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            required
          />
          <AdminButton onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword}>
            <Icon icon={saving ? "mdi:loading" : "mdi:lock-reset"} className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
            Change Password
          </AdminButton>
        </div>
      </div>
    </div>
  )
}
