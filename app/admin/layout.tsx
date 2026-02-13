"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface AdminUser {
  userId: number
  username: string
}

type NavItem = {
  id: string
  label: string
  icon: string
  href: string
  group: "content" | "system"
}

const navItems: NavItem[] = [
  { id: "projects", label: "Projects", icon: "mdi:folder-outline", href: "/admin/projects", group: "content" },
  { id: "awards", label: "Awards", icon: "mdi:trophy-outline", href: "/admin/awards", group: "content" },
  { id: "experiences", label: "Experiences", icon: "mdi:timeline-outline", href: "/admin/experiences", group: "content" },
  { id: "skills", label: "Skills", icon: "mdi:code-tags", href: "/admin/skills", group: "content" },
  { id: "sites", label: "Sites/Tools", icon: "mdi:web", href: "/admin/sites", group: "content" },
  { id: "games", label: "Games", icon: "mdi:gamepad-variant-outline", href: "/admin/games", group: "content" },
  { id: "fortune", label: "Fortune", icon: "mdi:ticket-outline", href: "/admin/fortune", group: "content" },
  { id: "media", label: "Media", icon: "mdi:image-outline", href: "/admin/media", group: "system" },
  { id: "settings", label: "Site Settings", icon: "mdi:cog-outline", href: "/admin/settings", group: "system" },
  { id: "profile", label: "Profile", icon: "mdi:account-cog-outline", href: "/admin/profile", group: "system" },
]

const contentItems = navItems.filter((n) => n.group === "content")
const systemItems = navItems.filter((n) => n.group === "system")

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Skip auth for login page
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.username) setUser(data)
        else router.push("/admin/login")
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false))
  }, [router, isLoginPage])

  if (isLoginPage) return <>{children}</>

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-mono text-muted-foreground">Loading admin panel...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const activeItem = navItems.find((n) => pathname.startsWith(n.href))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            title="Back to site"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          </a>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Icon icon="mdi:shield-crown-outline" className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Admin Panel</h1>
              <p className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">Dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-foreground">{user.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-muted-foreground transition-all hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
          >
            <Icon icon="mdi:logout" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "sticky top-[49px] h-[calc(100vh-49px)] border-r border-border bg-card/30 transition-all duration-300 max-md:hidden",
            sidebarCollapsed ? "w-14" : "w-56"
          )}
        >
          <div className="flex h-full flex-col justify-between p-2">
            <div className="flex flex-col gap-0.5">
              {/* Content group */}
              {!sidebarCollapsed && (
                <span className="mb-1 mt-2 px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                  Content
                </span>
              )}
              {contentItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      sidebarCollapsed && "justify-center px-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                  >
                    <Icon icon={item.icon} className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </a>
                )
              })}

              {/* System group */}
              <div className="my-2 h-px bg-border/50" />
              {!sidebarCollapsed && (
                <span className="mb-1 px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                  System
                </span>
              )}
              {systemItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      sidebarCollapsed && "justify-center px-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                  >
                    <Icon icon={item.icon} className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </a>
                )
              })}
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon
                icon={sidebarCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
                className="h-4 w-4"
              />
            </button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="sticky top-[49px] z-40 w-full overflow-x-auto border-b border-border bg-card/80 backdrop-blur-xl md:hidden">
          <div className="flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-1 px-4 py-2.5 text-[10px] transition-colors",
                    isActive
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon icon={item.icon} className="h-4 w-4" />
                  {item.label}
                </a>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb bar */}
          <div className="border-b border-border/50 bg-secondary/20 px-6 py-3 md:px-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon icon="mdi:home-outline" className="h-3.5 w-3.5" />
              <span>/</span>
              <span className="font-mono">{activeItem?.group || "admin"}</span>
              <span>/</span>
              <span className="font-mono font-medium text-foreground">{activeItem?.label || "Dashboard"}</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
