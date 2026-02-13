"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  { id: "contact", label: "Contact", icon: "mdi:contacts-outline", href: "/admin/contact", group: "content" },
  { id: "media", label: "Media", icon: "mdi:image-outline", href: "/admin/media", group: "system" },
  { id: "settings", label: "Site Settings", icon: "mdi:cog-outline", href: "/admin/settings", group: "system" },
  { id: "footer", label: "Footer", icon: "mdi:page-layout-footer", href: "/admin/footer", group: "system" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 px-3 py-2.5 backdrop-blur-xl sm:px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary md:hidden"
          >
            <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:flex"
            title="Back to site"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Icon icon="mdi:shield-crown-outline" className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Admin</h1>
              <p className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5 hidden sm:block">Dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-2 py-1.5 sm:px-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-foreground hidden sm:inline">{user.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2 text-xs text-muted-foreground transition-all hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive sm:px-3"
          >
            <Icon icon="mdi:logout" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop always visible, Mobile as overlay drawer */}
        <aside
          className={cn(
            "max-md:fixed max-md:left-0 max-md:top-[49px] max-md:z-50 max-md:h-[calc(100vh-49px)] max-md:shadow-xl",
            "sticky top-[49px] h-[calc(100vh-49px)] border-r border-border bg-card/95 max-md:bg-card transition-all duration-300",
            mobileMenuOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
            sidebarCollapsed ? "md:w-14" : "md:w-56",
            "max-md:w-64"
          )}
        >
          <div className="flex h-full flex-col justify-between p-2 overflow-y-auto">
            <div className="flex flex-col gap-0.5">
              {/* Back to site - mobile only */}
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-200 md:hidden"
              >
                <Icon icon="mdi:arrow-left" className="h-4 w-4 shrink-0" />
                <span>Back to site</span>
              </Link>
              <div className="my-1 h-px bg-border/50 md:hidden" />

              {/* Content group */}
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <span className="mb-1 mt-2 px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                  Content
                </span>
              )}
              {contentItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      sidebarCollapsed && !mobileMenuOpen && "md:justify-center md:px-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                  >
                    <Icon icon={item.icon} className="h-4 w-4 shrink-0" />
                    {(!sidebarCollapsed || mobileMenuOpen) && <span>{item.label}</span>}
                  </Link>
                )
              })}

              {/* System group */}
              <div className="my-2 h-px bg-border/50" />
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <span className="mb-1 px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                  System
                </span>
              )}
              {systemItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      sidebarCollapsed && !mobileMenuOpen && "md:justify-center md:px-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                  >
                    <Icon icon={item.icon} className="h-4 w-4 shrink-0" />
                    {(!sidebarCollapsed || mobileMenuOpen) && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>

            {/* Collapse toggle - desktop only */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon
                icon={sidebarCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
                className="h-4 w-4"
              />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {/* Breadcrumb bar */}
          <div className="border-b border-border/50 bg-secondary/20 px-4 py-2.5 sm:px-6 md:px-8 md:py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon icon="mdi:home-outline" className="h-3.5 w-3.5" />
              <span>/</span>
              <span className="font-mono">{activeItem?.group || "admin"}</span>
              <span>/</span>
              <span className="font-mono font-medium text-foreground">{activeItem?.label || "Dashboard"}</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
