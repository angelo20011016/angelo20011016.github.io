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
  const subtitleRef = useRef(null);
  const photoRef = useRef(null);

  const titleParts = settings?.hero_main_title.trim().split(/\s+/).filter(Boolean) ?? [];
  const titleFirstLine = titleParts[0] || "DEVELOPER";
  const titleSecondLine = titleParts.slice(1).join(' ') || "DEVELOPER";

  const getHeroImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    if (url.startsWith('/static/')) return `${API_BASE_URL}${url}`;
    return url;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const data = await getHeroSettings();
        data.hero_personal_photo_url = getHeroImageUrl(data.hero_personal_photo_url);
        if (isMounted) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load hero settings:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
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
    <section id="hero" ref={containerRef} className="relative min-h-screen w-full flex flex-col justify-center items-center px-5 sm:px-8 overflow-hidden bg-background">
      {/* Background Photo (Dennis Style: Subtle, maybe off-center) */}
      <div ref={photoRef} className="absolute right-[10%] top-[20%] w-[30vw] h-[40vw] opacity-0 pointer-events-none">
         <Image 
            src={settings.hero_personal_photo_url || "/placeholder.svg"}
            alt="Hero Background"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            priority
         />
      </div>

      <div className="z-10 w-full flex flex-col items-start space-y-3 sm:space-y-4">
        <div className="mask-reveal w-full">
           <h1 className="mask-reveal-inner max-w-full text-[clamp(4rem,12vw,12rem)] leading-[0.9] font-mono font-bold uppercase tracking-normal whitespace-nowrap">
             {titleFirstLine}
           </h1>
        </div>
        <div className="mask-reveal w-full">
           <h1 className="mask-reveal-inner max-w-full text-[clamp(3.25rem,10.5vw,10.5rem)] leading-[0.9] font-mono font-bold uppercase tracking-normal whitespace-nowrap">
             {titleSecondLine}
           </h1>
        </div>

        <div ref={subtitleRef} className="flex flex-col md:flex-row md:items-center w-full mt-12 gap-8 md:gap-64">
          <p className="max-w-md text-xl text-white/70 font-inter uppercase tracking-widest leading-relaxed">
            {settings.hero_subtitle || "Based in Taiwan, creating premium digital experiences with a focus on motion and interaction."}
          </p>
          
          <div className="flex items-center">
            <Magnetic>
              <ScrollLink
                to="portfolio"
                smooth={true}
                className="w-28 h-28 md:w-32 md:h-32 bg-primary rounded-full flex items-center justify-center text-white font-mono uppercase text-[0.65rem] md:text-xs tracking-widest cursor-pointer hover:scale-105 transition-transform"
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
