import React from "react"
import type { Viewport } from "next"
import { headers } from "next/headers"
import { Inter, JetBrains_Mono } from "next/font/google"
import { LocaleProvider } from "@/lib/locale-context"
import { ThemeContextProvider } from "@/lib/theme-context"
import { UmamiTracker } from "@/components/umami-tracker"
import { getDictionary, type Locale } from "@/lib/i18n"

import "@/app/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export async function generateMetadata() {
  const hdrs = await headers()
  const host = hdrs.get("host") || "kjch.net"
  const acceptLang = hdrs.get("accept-language") || ""
  const locale: Locale = acceptLang.toLowerCase().startsWith("zh") ? "zh" : "en"
  const dict = getDictionary(locale)

  return {
    title: `${dict.meta.title} | ${host}`,
    description: dict.meta.description,
    keywords: ["kjch", "况佳城", "developer", "portfolio", "personal website"],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/site.webmanifest",
  }
}

export const viewport: Viewport = {
  themeColor: "#0f1114",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@iconify/iconify@3/dist/iconify.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('kjch-locale');var nav=(navigator.language||'').toLowerCase();var loc=(l==='zh'||l==='en')?l:(nav.startsWith('zh')?'zh':'en');document.documentElement.setAttribute('lang',loc);var m=localStorage.getItem('kjch-mode')||'light';var c=localStorage.getItem('kjch-color')||'blue';document.documentElement.setAttribute('data-mode',m);document.documentElement.setAttribute('data-color',c);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeContextProvider>
          <LocaleProvider>
            {children}
            <UmamiTracker />
          </LocaleProvider>
        </ThemeContextProvider>
      </body>
    </html>
  )
}
