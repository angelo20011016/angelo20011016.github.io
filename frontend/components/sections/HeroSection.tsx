"use client";

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Link as ScrollLink } from 'react-scroll';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import SkillCloud from './SkillCloud';
import VisionAndNewsletter from './VisionAndNewsletter';
import HobbiesSection from './HobbiesSection'; // Import HobbiesSection component
import { HeroSettings, getHeroSettings } from '../../services/staticContentService';

const HeroSection: React.FC = () => {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const titleRef = useRef(null);
  const bioRef = useRef(null);
  const buttonsRef = useRef(null);
  const skillCloudRef = useRef(null);
  const visionAndNewsletterRef = useRef(null);
  const hobbiesSectionRef = useRef(null);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="char inline-block whitespace-pre">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  const handleMouseEnterTitle = () => {
    gsap.to(titleRef.current?.querySelectorAll('.char'), {
      y: -5,
      x: (i) => (i % 2 === 0 ? -5 : 5),
      rotation: (i) => (i % 2 === 0 ? -5 : 5),
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.out',
    });
  };

  const handleMouseLeaveTitle = () => {
    gsap.to(titleRef.current?.querySelectorAll('.char'), {
      y: 0,
      x: 0,
      rotation: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getHeroSettings();
        setSettings(data);
      } catch (err) {
        setError("Failed to load hero settings.");
        console.error("Failed to load hero settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    if (sectionRef.current) {
      // Animation for the personal photo
      gsap.fromTo(photoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
      // Initial animation for the main title (fade in)
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 }
      );
      // Animation for the bio text
      gsap.fromTo(bioRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.8 }
      );
      // Animation for the buttons
      gsap.fromTo(buttonsRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 1.1 }
      );
      // Animation for SkillCloud
      gsap.fromTo(skillCloudRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: skillCloudRef.current,
            start: 'top center+=200',
            toggleActions: 'play none none reverse',
          }
        }
      );
      // Animation for VisionAndNewsletter
      gsap.fromTo(visionAndNewsletterRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: visionAndNewsletterRef.current,
            start: 'top center+=200',
            toggleActions: 'play none none reverse',
          }
        }
      );
      // Animation for HobbiesSection
      gsap.fromTo(hobbiesSectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: hobbiesSectionRef.current,
            start: 'top center+=200',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading Hero Section...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-red-500">Error: {error}</div>;
  }

  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-gray-500">No Hero settings found.</div>;
  }

  return (
    <section id="hero" ref={sectionRef} className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-black text-white text-center relative z-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={settings.hero_background_image_url || "https://images.unsplash.com/photo-1531297484001-80022131f5a1"}
          alt="Abstract Background"
          fill
          className="object-cover opacity-10" // Adjust opacity as needed for subtlety
          priority
        />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center py-16 relative z-10">
        {/* Personal Photo */}
        <div ref={photoRef} className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg relative">
          <Image
            src={settings.hero_personal_photo_url || "https://img8.uploadhouse.com/fileuploads/31936/31936778eb4b70130f3289122781a71f94414143.jpg"}
            alt="Angelo照片"
            fill
            className="object-cover"
            sizes="(max-width: 767px) 192px, 256px"
            priority
          />
        </div>

        <h1
          ref={titleRef}
          className="font-mono text-6xl md:text-9xl font-bold tracking-tight uppercase mb-8"
          onMouseEnter={handleMouseEnterTitle}
          onMouseLeave={handleMouseLeaveTitle}
        >
          {splitText(settings.hero_main_title)}
          <br />
          {splitText(settings.hero_subtitle)}
        </h1>
        <div ref={bioRef} className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed mb-12 prose prose-invert">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {settings.hero_bio_content}
          </ReactMarkdown>
        </div>
        <div ref={buttonsRef} className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
          <ScrollLink
            to="portfolio"
            smooth={true}
            duration={800}
            className="cursor-pointer px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-lg rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-lg"
          >
            {settings.hero_button_1_label}
          </ScrollLink>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={800}
            className="cursor-pointer px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-wider text-lg rounded-full hover:bg-white hover:text-black transition-colors duration-300 shadow-lg"
          >
            {settings.hero_button_2_label}
          </ScrollLink>
        </div>

        {/* SkillCloud Component */}
        <div ref={skillCloudRef} className="mb-20">
          <SkillCloud />
        </div>

        {/* VisionAndNewsletter Component */}
        <div ref={visionAndNewsletterRef} className="mb-20">
          <VisionAndNewsletter />
        </div>

        {/* HobbiesSection Component */}
        <div ref={hobbiesSectionRef}>
          <HobbiesSection />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;