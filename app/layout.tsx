import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { LocaleProvider } from "@/lib/locale-context"
import { ThemeContextProvider } from "@/lib/theme-context"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "kjch - 况佳城 | Personal Website",
  description:
    "况佳城 (kjch) 的个人网站。热爱互联网，喜欢探索新奇的事物。Personal website of Kuang Jiacheng.",
  keywords: ["kjch", "况佳城", "developer", "portfolio", "personal website"],
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
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeContextProvider>
      </body>
    </html>
  )
}
