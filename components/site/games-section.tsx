"use client"

import { Icon } from "@iconify/react"
import { useLocale } from "@/lib/locale-context"
import { useInView } from "@/hooks/use-in-view"
import { useSiteData } from "@/hooks/use-site-data"
import { cn } from "@/lib/utils"
import { trackGameClick } from "@/lib/umami"

function GameIcon({ icon, className }: { icon?: string; className?: string }) {
    if (!icon) return <Icon icon="mdi:gamepad-variant" className={className} />
    if (icon.startsWith("http")) return <img src={icon} alt="" className={cn(className, "object-contain")} />
    return <Icon icon={icon} className={className} />
}

export function GamesSection() {
    const { dict, locale } = useLocale()
    const { ref, isInView } = useInView()
    const { games } = useSiteData()

    if (!games || games.length === 0) return null

    return (
        <section id="games" className="relative px-6 py-24 md:px-12" ref={ref}>
            <div className={cn("mx-auto max-w-5xl transition-all duration-700", isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12")}>
                {/* Section Header */}
                <div className="mb-10 flex items-center gap-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-primary">07</span>
                    <div className="h-px flex-1 bg-border" />
                    <h2 className="text-xl font-bold md:text-2xl">{dict.games.title}</h2>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <p className="mb-8 text-center font-mono text-xs text-muted-foreground">
                    {dict.games.subtitle}
                </p>

                {/* Games - flowing pill/chip layout */}
                <div className="flex flex-wrap justify-center gap-4">
                    {games.map((game, index) => {
                        const hasDetails = game.hoursPlayed || game.maxLevel || (game.showAccount && game.accountName)
                        return (
                            <div
                                key={game.id}
                                className={cn(
                                    "group relative",
                                    isInView ? "opacity-100 scale-100" : "opacity-0 scale-90"
                                )}
                                style={{
                                    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    transitionDelay: isInView ? `${index * 60}ms` : "0ms",
                                }}
                            >
                                <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)] hover:-translate-y-1 min-w-[100px]">
                                    {/* Game Icon / Logo */}
                                    {game.icon?.startsWith("http") ? (
                                        <div className="flex h-[4.5rem] w-[8.5rem] shrink-0 items-center justify-center transition-all duration-300 group-hover:scale-110">
                                            <img src={game.icon} alt="" className="max-h-[85%] max-w-[85%] object-contain" />
                                        </div>
                                    ) : (
                                        <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110">
                                            <GameIcon icon={game.icon} className="h-8 w-8" />
                                        </div>
                                    )}

                                    {/* Info - below icon */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight text-center">
                                            {game.title[locale]}
                                        </span>
                                        {hasDetails && (
                                            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                                                {game.hoursPlayed && (
                                                    <span className="flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground/70">
                                                        <Icon icon="mdi:clock-outline" className="h-3 w-3" />
                                                        {game.hoursPlayed}h
                                                    </span>
                                                )}
                                                {game.maxLevel && (
                                                    <span className="flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground/70">
                                                        <Icon icon="mdi:trophy-outline" className="h-3 w-3" />
                                                        {game.maxLevel}
                                                    </span>
                                                )}
                                                {game.showAccount && game.accountName && (
                                                    <span className="flex items-center gap-0.5 font-mono text-[10px] text-primary/60">
                                                        <Icon icon="mdi:account-outline" className="h-3 w-3" />
                                                        {game.accountName}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Link overlay */}
                                {game.url && (
                                    <a
                                        href={game.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 rounded-2xl"
                                        aria-label={game.title[locale]}
                                        onClick={() => trackGameClick(game.id, game.title[locale])}
                                        data-umami-event="game-click"
                                        data-umami-event-game={game.title[locale]}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
