"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"
import { trackCategoryFilter } from "@/lib/umami"

const categoryOrder = ["frontend", "backend", "devops", "design", "os", "ops"] as const

export function SkillsSection() {
  const { dict } = useLocale()
  const { ref, isInView } = useInView()
  const { skills } = useSiteData()
  const [activeTab, setActiveTab] = useState<string>("frontend")
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const filteredSkills = skills.filter((s) => s.category === activeTab)

  return (
    <section id="skills" className="relative px-6 py-32 md:px-12" ref={ref}>
      <div className={cn("mx-auto max-w-4xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
        {/* Section label */}
        <div className="mb-12 flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">04</span>
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-2xl font-bold md:text-3xl">{dict.skills.title}</h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-10 text-center font-mono text-sm text-muted-foreground">
          {dict.skills.subtitle}
        </p>

        {/* Category tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categoryOrder.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); trackCategoryFilter(`skills-${cat}`) }}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-mono transition-all duration-300",
                activeTab === cat
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {dict.skills.categories[cat as keyof typeof dict.skills.categories]}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filteredSkills.map((skill, i) => (
            <div
              key={skill.name}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-300",
                "hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)] hover:-translate-y-1",
                hoveredSkill && hoveredSkill !== skill.name && "opacity-40"
              )}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <Icon
                icon={skill.icon}
                className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-center text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
