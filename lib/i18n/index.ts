import zh from "./zh"
import en from "./en"

export type Locale = "zh" | "en"
export type Dictionary = typeof zh

const dictionaries: Record<Locale, Dictionary> = { zh, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.zh
}
