"use client";

import React from 'react';
import PortfolioList from './PortfolioList';
import { motion } from 'framer-motion';

const PortfolioSection: React.FC = () => {
  return (
    <section id="portfolio" className="relative min-h-screen w-full flex flex-col pt-32 pb-20 bg-background text-white">
      <div className="px-8 mb-20">
        <div className="mask-reveal">
           <motion.h2 
             initial={{ y: "100%" }}
             whileInView={{ y: "0%" }}
             transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
             className="text-[10vw] font-mono font-bold uppercase tracking-tighter leading-none"
           >
             Selected Work
           </motion.h2>
        </div>
        <div className="flex justify-end mt-4">
           <p className="max-w-xs text-white/60 font-mono text-sm uppercase tracking-widest text-right">
             A collection of projects exploring the intersection of design, code, and interaction.
           </p>
        </div>
      </div>
      
      <PortfolioList />
    </section>
  );
};

export default PortfolioSection;
