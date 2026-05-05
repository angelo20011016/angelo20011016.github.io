"use client";

import React, { useEffect, useState } from 'react';
import PortfolioList from './PortfolioList';
import { motion } from 'framer-motion';
import { SiteSettings, getSiteSettings } from '../../services/staticContentService';

const PortfolioSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const title = settings?.portfolio_title?.trim();
  const displayTitle = title || "Portfolio";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load site settings:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="portfolio" className="relative min-h-screen w-full bg-[#111214] px-5 py-24 text-white sm:px-8 lg:py-32">
      <div className="mx-auto mb-16 max-w-7xl lg:mb-24">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="mask-reveal">
           <motion.h2 
             initial={{ y: "100%" }}
             whileInView={{ y: "0%" }}
             transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
             className="text-[clamp(3.4rem,9vw,9rem)] font-mono font-bold uppercase tracking-normal leading-[0.9]"
           >
             {displayTitle}
           </motion.h2>
          </div>
          <div className="flex flex-col gap-8 lg:items-end">
            <p className="max-w-xl text-lg leading-8 text-white/60 lg:text-right">
             {settings?.portfolio_subtitle || "A collection of projects exploring the intersection of design, code, and interaction."}
           </p>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/35">
              {settings?.portfolio_kicker || "Portfolio / selected case studies / shipped work"}
            </p>
          </div>
        </div>
      </div>
      
      <PortfolioList />
    </section>
  );
};

export default PortfolioSection;
