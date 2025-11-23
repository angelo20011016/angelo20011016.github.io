"use client";

import HeroSection from "@/components/sections/HeroSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import BlogSection from "@/components/sections/BlogSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <PortfolioSection />
      <BlogSection />
      <ContactSection />
    </div>
  );
}

