"use client"

import { useLocale } from "@/lib/locale-context"

export function Footer() {
  const { dict } = useLocale()

  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
        <p className="text-center text-xs italic text-muted-foreground/50">
          {dict.footer.source}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
          <span>&copy; {new Date().getFullYear()} {dict.footer.copyright}</span>
          <span className="text-border">|</span>
          <span className="font-mono">{dict.footer.builtWith}</span>
        </div>
      </div>
    </footer>
  )
}
