"use client";

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Link as ScrollLink } from 'react-scroll';
import Image from 'next/image';
import { HeroSettings, getHeroSettings } from '../../services/staticContentService';
import { API_BASE_URL } from '../../services/authService';
import Magnetic from '../common/Magnetic';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const containerRef = useRef(null);
  const titleRow1 = useRef(null);
  const titleRow2 = useRef(null);
  const subtitleRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getHeroSettings();
        if (data.hero_personal_photo_url && !data.hero_personal_photo_url.startsWith('http')) {
          data.hero_personal_photo_url = `${API_BASE_URL}${data.hero_personal_photo_url}`;
        }
        setSettings(data);
      } catch (err) {
        console.error("Failed to load hero settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!loading && settings) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(".mask-reveal-inner", 
        { y: "100%" }, 
        { y: "0%", duration: 1.5, stagger: 0.1, delay: 0.5 }
      )
      .fromTo(photoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 0.8, duration: 1.5 },
        "-=1"
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.5"
      );
    }
  }, [loading, settings]);

  if (loading) return null;
  if (!settings) return null;

  return (
    <section id="hero" ref={containerRef} className="relative min-h-screen w-full flex flex-col justify-center items-center px-8 overflow-hidden bg-background">
      {/* Background Photo (Dennis Style: Subtle, maybe off-center) */}
      <div ref={photoRef} className="absolute right-[10%] top-[20%] w-[30vw] h-[40vw] opacity-0 pointer-events-none">
         <Image 
            src={settings.hero_personal_photo_url || "/placeholder.jpg"}
            alt="Hero Background"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            priority
         />
      </div>

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-start space-y-4">
        <div className="mask-reveal">
           <h1 className="mask-reveal-inner text-[12vw] leading-[0.9] font-mono font-bold uppercase tracking-tighter">
             {settings.hero_main_title.split(' ')[0] || "DEVELOPER"}
           </h1>
        </div>
        <div className="mask-reveal">
           <h1 className="mask-reveal-inner text-[12vw] leading-[0.9] font-mono font-bold uppercase tracking-tighter ml-[10vw]">
             {settings.hero_main_title.split(' ').slice(1).join(' ') || "& DESIGNER"}
           </h1>
        </div>

        <div ref={subtitleRef} className="flex flex-col md:flex-row md:items-end justify-between w-full mt-12 space-y-8 md:space-y-0">
          <p className="max-w-md text-xl text-white/70 font-inter uppercase tracking-widest leading-relaxed">
            {settings.hero_subtitle} — Based in Taiwan, creating premium digital experiences with a focus on motion and interaction.
          </p>
          
          <div className="flex space-x-12 items-center">
            <Magnetic>
              <ScrollLink
                to="portfolio"
                smooth={true}
                className="w-44 h-44 bg-primary rounded-full flex items-center justify-center text-white font-mono uppercase text-sm tracking-widest cursor-pointer hover:scale-105 transition-transform"
                data-cursor-text="Work"
              >
                View Work
              </ScrollLink>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 font-mono text-xs uppercase tracking-[0.2em] font-bold"
      >
        Scroll to explore
      </motion.div>
    </section>
  );
};

export default HeroSection;
