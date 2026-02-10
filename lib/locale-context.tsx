"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { getDictionary, type Locale, type Dictionary } from "@/lib/i18n"

interface LocaleContextType {
  locale: Locale
  dict: Dictionary
  setLocale: (l: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh")

  useEffect(() => {
    const saved = localStorage.getItem("kjch-locale") as Locale | null
    if (saved && (saved === "zh" || saved === "en")) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("kjch-locale", l)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "zh" ? "en" : "zh"
      localStorage.setItem("kjch-locale", next)
      return next
    })
  }, [])

  const dict = getDictionary(locale)

  return (
    <LocaleContext.Provider value={{ locale, dict, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}
