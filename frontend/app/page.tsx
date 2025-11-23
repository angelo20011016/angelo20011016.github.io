"use client";

import HeroSection from "../src/components/sections/HeroSection";
import PortfolioSection from "../src/components/sections/PortfolioSection";
import BlogSection from "../src/components/sections/BlogSection";
import ContactSection from "../src/components/sections/ContactSection";

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

