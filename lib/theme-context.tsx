"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type ThemeMode = "dark" | "light"
export type ThemeColor = "gold" | "blue" | "pink" | "green"

export interface ColorOption {
  id: ThemeColor
  label: string
  swatch: string
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: "gold", label: "Gold", swatch: "#e5a830" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "pink", label: "Pink", swatch: "#ec4899" },
  { id: "green", label: "Green", swatch: "#34d399" },
]

interface ThemeContextType {
  mode: ThemeMode
  color: ThemeColor
  setMode: (m: ThemeMode) => void
  setColor: (c: ThemeColor) => void
  toggleMode: () => void
  colorOptions: ColorOption[]
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const VALID_MODES: ThemeMode[] = ["dark", "light"]
const VALID_COLORS: ThemeColor[] = ["gold", "blue", "pink", "green"]

function applyTheme(mode: ThemeMode, color: ThemeColor) {
  document.documentElement.setAttribute("data-mode", mode)
  document.documentElement.setAttribute("data-color", color)
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light")
  const [color, setColorState] = useState<ThemeColor>("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem("kjch-mode") as ThemeMode | null
    const savedColor = localStorage.getItem("kjch-color") as ThemeColor | null
    const m = savedMode && VALID_MODES.includes(savedMode) ? savedMode : "light"
    const c = savedColor && VALID_COLORS.includes(savedColor) ? savedColor : "blue"
    setModeState(m)
    setColorState(c)
    applyTheme(m, c)
    setMounted(true)
  }, [])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem("kjch-mode", m)
    applyTheme(m, color)
  }, [color])

  const setColor = useCallback((c: ThemeColor) => {
    setColorState(c)
    localStorage.setItem("kjch-color", c)
    applyTheme(mode, c)
  }, [mode])

  const toggleMode = useCallback(() => {
    const next = mode === "dark" ? "light" : "dark"
    setMode(next)
  }, [mode, setMode])

  const value = { mode, color, setMode, setColor, toggleMode, colorOptions: COLOR_OPTIONS }

  return (
    <ThemeContext.Provider value={value}>
      <div style={mounted ? undefined : { visibility: "hidden" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeContextProvider")
  return ctx
}
