"use client";

import { useEffect, useMemo, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import BlogSection from "@/components/sections/BlogSection";
import ContactSection from "@/components/sections/ContactSection";
import SkillCloud from "@/components/sections/SkillCloud";
import AboutSection from "@/components/sections/AboutSection";
import { getSiteSettings, SiteSettings } from "@/services/staticContentService";

type HomeSectionId = "hero" | "about" | "skills" | "portfolio" | "blog" | "contact";

const defaultSections: Array<{ id: HomeSectionId; enabled: boolean; order: number }> = [
  { id: "hero", enabled: true, order: 1 },
  { id: "about", enabled: true, order: 2 },
  { id: "skills", enabled: true, order: 3 },
  { id: "portfolio", enabled: true, order: 4 },
  { id: "blog", enabled: true, order: 5 },
  { id: "contact", enabled: true, order: 6 },
];

function buildSections(settings: SiteSettings | null) {
  if (!settings) return defaultSections;

  return [
    { id: "hero", enabled: settings.section_hero_enabled, order: settings.section_hero_order },
    { id: "about", enabled: settings.section_about_enabled, order: settings.section_about_order },
    { id: "skills", enabled: settings.section_skills_enabled, order: settings.section_skills_order },
    { id: "portfolio", enabled: settings.section_portfolio_enabled, order: settings.section_portfolio_order },
    { id: "blog", enabled: settings.section_blog_enabled, order: settings.section_blog_order },
    { id: "contact", enabled: settings.section_contact_enabled, order: settings.section_contact_order },
  ] satisfies Array<{ id: HomeSectionId; enabled: boolean; order: number }>;
}

function renderHomeSection(id: HomeSectionId) {
  switch (id) {
    case "hero":
      return <HeroSection />;
    case "about":
      return <AboutSection />;
    case "skills":
      return (
        <div className="bg-background flex flex-col items-center justify-center">
          <SkillCloud />
        </div>
      );
    case "portfolio":
      return <PortfolioSection />;
    case "blog":
      return <BlogSection />;
    case "contact":
      return <ContactSection />;
  }
}

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load homepage section settings:", error);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const sections = useMemo(
    () => buildSections(settings)
      .filter((section) => section.enabled)
      .sort((a, b) => a.order - b.order),
    [settings]
  );

  return (
    <div className="flex flex-col">
      {sections.map((section) => (
        <div key={section.id}>{renderHomeSection(section.id)}</div>
      ))}
    </div>
  );
}
