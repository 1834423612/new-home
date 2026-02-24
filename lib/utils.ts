import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const RELATED_LINK_ID_LENGTH = 12

const ALPHA_ID_CHARS = "abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ"

export function generateRandomAlphaId(length = RELATED_LINK_ID_LENGTH): string {
  const size = Number.isFinite(length) && length > 0 ? Math.floor(length) : RELATED_LINK_ID_LENGTH
  let result = ""
  for (let i = 0; i < size; i += 1) {
    result += ALPHA_ID_CHARS[Math.floor(Math.random() * ALPHA_ID_CHARS.length)]
  }
  return result
}
