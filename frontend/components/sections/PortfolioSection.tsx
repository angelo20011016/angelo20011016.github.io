"use client";

import React from 'react';
import PortfolioCarousel from './PortfolioCarousel';
import { ScrollReveal } from '../common/ScrollReveal';

const PortfolioSection: React.FC = () => {
  return (
    <section id="portfolio" className="relative min-h-screen w-full flex flex-col items-center justify-center p-8 md:p-16 bg-transparent text-white overflow-hidden">
      <ScrollReveal className="w-full flex justify-center">
        <h2 className="relative z-10 font-mono text-5xl md:text-7xl font-bold mb-16 tracking-wide text-center">
          我的作品集
        </h2>
      </ScrollReveal>
      
      <ScrollReveal className="w-full" delay={0.4}>
        <div className="relative z-10 w-full">
          <PortfolioCarousel />
        </div>
      </ScrollReveal>
    </section>
  );
};

export default PortfolioSection;

