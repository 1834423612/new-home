"use client"

import React from "react"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "same-origin",
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      // Use full page reload so the browser sends the newly set cookie
      window.location.href = "/admin"
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
            <Icon icon="mdi:shield-lock-outline" className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            kjch.me / admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-xs font-mono text-muted-foreground"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="admin"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-mono text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="********"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:shadow-[0_0_16px_hsl(var(--primary)/0.3)] disabled:opacity-50"
          >
            {loading ? (
              <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon icon="mdi:login" className="h-4 w-4" />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon icon="mdi:arrow-left" className="h-3.5 w-3.5" />
          Back to site
        </a>
      </div>
    </div>
  )
}
