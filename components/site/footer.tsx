"use client"

import { useLocale } from "@/lib/locale-context"
import { useSiteConfig } from "@/hooks/use-site-config"
import { useSiteData, type FooterSponsor } from "@/hooks/use-site-data"
import { Icon } from "@iconify/react"
import Image from "next/image"

export function Footer() {
  const { dict, locale } = useLocale()
  const { config } = useSiteConfig()
  const { footerSponsors } = useSiteData()
  const c = (key: string, fallback: string) => config[`${key}_${locale}`] || config[key] || fallback

  const icpNumber = config["footer_icp"] || ""
  const icpUrl = config["footer_icp_url"] || "https://beian.miit.gov.cn/"
  const gonganNumber = config["footer_gongan"] || ""
  const gonganUrl = config["footer_gongan_url"] || "http://www.beian.gov.cn/"
  const visitorCounterUrl = config["footer_visitor_counter_url"] || ""

  const hasSponsors = footerSponsors.length > 0
  const hasIcp = !!(icpNumber || gonganNumber)
  const hasVisitor = !!visitorCounterUrl

  return (
    <footer className="border-t border-border px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2">
        {/* ── Sponsors ── */}
        {hasSponsors && (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] md:text-[12px] font-mono uppercase tracking-widest text-muted-foreground/80">
              {dict.footer.sponsors}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {footerSponsors.map((sponsor) => (
                <SponsorItem key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </div>
        )}

        {/* ── ICP Filing (inline) ── */}
        {hasIcp && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-2 -mb-4 text-[10px] md:text-[12px] text-slate-600/70">
            {icpNumber && (
              <a href={icpUrl} target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground hover:underline gap-1 transition-colors">
                <img src="/beian.svg" alt="ICP" className="inline h-4 md:h-5 w-auto mr-1" />
                {icpNumber}
              </a>
            )}
            {gonganNumber && (
              <a href={gonganUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-muted-foreground hover:underline transition-colors">
                {/* <Icon icon="mdi:shield-check-outline" className="h-3 w-3" /> */}
                <img src="/gongan.png" alt="Gongan" className="inline h-4 md:h-5 w-auto" />
                {gonganNumber}
              </a>
            )}
          </div>
        )}

        {/* ── Bottom: visitor counter → quote → copyright ── */}
        <div className="flex flex-col items-center gap-1">
          {hasVisitor && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={visitorCounterUrl}
              alt="visitor counter"
              className="h-14"
              loading="lazy"
            />
          )}
          <p className="text-center text-xs italic text-muted-foreground/60">
            {c("footer_source", dict.footer.source)}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span>&copy; 2019-{new Date().getFullYear()} {c("footer_copyright", dict.footer.copyright)}</span>
            <span className="text-border">|</span>
            <span className="font-mono">{c("footer_built_with", dict.footer.builtWith)}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SponsorItem({ sponsor }: { sponsor: FooterSponsor }) {
  const isIconify = sponsor.logo && !sponsor.logo.startsWith("http") && !sponsor.logo.startsWith("/")
  const content = (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-transparent px-1 py-1.5 text-muted-foreground/60 transition-colors hover:border-border hover:text-foreground hover:bg-muted/30">
      {sponsor.logo && (
        isIconify ? (
          <Icon icon={sponsor.logo} className="h-5 w-auto shrink-0" />
        ) : (
          <Image
            src={sponsor.logo}
            alt={sponsor.name}
            width={40}
            height={20}
            className="h-5 w-auto shrink-0 object-contain"
          />
        )
      )}
      {/* <span className="text-[8px] md:text-[12px] font-medium">{sponsor.name}</span> */}
    </div>
  )

  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }
  return content
}

