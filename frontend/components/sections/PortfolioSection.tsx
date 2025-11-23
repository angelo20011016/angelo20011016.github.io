"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image'; // ADDED THIS IMPORT
import PortfolioCarousel from './PortfolioCarousel'; // Import the new carousel component

const PortfolioSection: React.FC = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (sectionRef.current) {
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
    }
  }, []);

  return (
    <section ref={sectionRef} id="portfolio" className="relative min-h-screen w-full flex flex-col items-center justify-center p-8 md:p-16 bg-zinc-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba"
          alt="Portfolio Background"
          fill
          className="object-cover opacity-15" // Slightly more noticeable than Hero, but still subtle
          priority
        />
      </div>
      <h2 ref={titleRef} className="relative z-10 font-mono text-5xl md:text-7xl font-bold mb-16 tracking-wide">
        我的作品集
      </h2>
      <div className="relative z-10 w-full"> {/* Ensure carousel content is above background */}
        <PortfolioCarousel />
      </div>
    </section>
  );
};

export default PortfolioSection;

