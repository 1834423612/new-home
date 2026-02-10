"use client"

import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"

export function ExperienceSection() {
  const { dict, locale } = useLocale()
  const { ref, isInView } = useInView()
  const { experiences } = useSiteData()

  return (
    <section id="experience" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-4xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        {/* Section label */}
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">03</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.experience.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-12 text-center font-mono text-sm text-muted-foreground">
          {dict.experience.subtitle}
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2" />

          <div className="flex flex-col gap-12">
            {experiences.map((exp, i) => {
              const isLeft = i % 2 === 0
              return (
                <div
                  key={exp.id}
                  className={cn(
                    "relative flex items-start gap-6",
                    "md:gap-0",
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-6 z-10 flex h-3 w-3 items-center justify-center rounded-full -translate-x-1/2",
                      "md:left-1/2",
                      i === 0
                        ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                        : "bg-muted-foreground/40"
                    )}
                  />

                  {/* Date column */}
                  <div
                    className={cn(
                      "hidden md:flex md:w-1/2 md:items-start md:pt-0.5",
                      isLeft ? "md:justify-end md:pr-12" : "md:justify-start md:pl-12"
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : `- ${dict.experience.present}`}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    className={cn(
                      "ml-12 md:ml-0 md:w-1/2",
                      isLeft ? "md:pl-12" : "md:pr-12"
                    )}
                  >
                    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.06)]">
                      <div className="mb-2 flex items-center gap-3">
                        {exp.icon && (
                          <Icon icon={exp.icon} className="h-5 w-5 text-primary" />
                        )}
                        <h3 className="font-bold text-foreground">{exp.title[locale]}</h3>
                      </div>
                      <p className="mb-1 text-sm font-mono text-primary/80">{exp.org[locale]}</p>
                      <span className="mb-3 block font-mono text-[10px] text-muted-foreground md:hidden">
                        {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : `- ${dict.experience.present}`}
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {exp.description[locale]}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
