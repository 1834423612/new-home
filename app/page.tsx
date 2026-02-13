"use client"

import { HeroSection } from "@/components/site/hero-section"
import { AboutSection } from "@/components/site/about-section"
import { ProjectsSection } from "@/components/site/projects-section"
import { AwardsSection } from "@/components/site/awards-section"
import { ExperienceSection } from "@/components/site/experience-section"
import { SkillsSection } from "@/components/site/skills-section"
import { FortuneSection } from "@/components/site/fortune-section"
import { SitesSection } from "@/components/site/sites-section"
import { GamesSection } from "@/components/site/games-section"
import { ContactSection } from "@/components/site/contact-section"
import { Footer } from "@/components/site/footer"
import { SideNav } from "@/components/site/side-nav"
import { MobileNav } from "@/components/site/mobile-nav"

export default function Home() {
  return (
    <main className="relative">
      <SideNav />
      <MobileNav />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <AwardsSection />
      <ExperienceSection />
      <SkillsSection />
      <FortuneSection />
      <SitesSection />
      <GamesSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
