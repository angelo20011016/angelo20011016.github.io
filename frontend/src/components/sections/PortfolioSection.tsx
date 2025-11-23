"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import PortfolioCarousel from './PortfolioCarousel'; // Import the new carousel component

const PortfolioSection: React.FC = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=200',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} id="portfolio" className="min-h-screen w-full flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900 text-white">
      <h2 ref={titleRef} className="font-mono text-5xl md:text-7xl font-bold mb-16 tracking-wide">
        我的作品集
      </h2>
      <PortfolioCarousel />
    </section>
  );
};

export default PortfolioSection;

