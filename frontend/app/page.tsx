"use client";

import HeroSection from "@/components/sections/HeroSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import BlogSection from "@/components/sections/BlogSection";
import ContactSection from "@/components/sections/ContactSection";
import SkillCloud from "@/components/sections/SkillCloud";
import HobbiesSection from "@/components/sections/HobbiesSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="bg-background flex flex-col items-center justify-center">
        <SkillCloud />
        <HobbiesSection />
      </div>
      <PortfolioSection />
      <BlogSection />
      <ContactSection />
    </div>
  );
}

