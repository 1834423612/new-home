"use client"

import { useLocale } from "@/lib/locale-context"
import { useSiteConfig } from "@/hooks/use-site-config"

export function Footer() {
  const { dict, locale } = useLocale()
  const { config } = useSiteConfig()
  const c = (key: string, fallback: string) => config[`${key}_${locale}`] || config[key] || fallback

  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
        <p className="text-center text-xs italic text-muted-foreground/50">
          {c("footer_source", dict.footer.source)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
          <span>&copy; {new Date().getFullYear()} {c("footer_copyright", dict.footer.copyright)}</span>
          <span className="text-border">|</span>
          <span className="font-mono">{c("footer_built_with", dict.footer.builtWith)}</span>
        </div>
      </div>
    </footer>
  )
}
