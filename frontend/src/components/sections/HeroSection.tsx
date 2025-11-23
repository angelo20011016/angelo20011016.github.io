"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link as ScrollLink } from 'react-scroll';
import Image from 'next/image';
import SkillCloud from './SkillCloud';
import VisionAndNewsletter from './VisionAndNewsletter';
import HobbiesSection from './HobbiesSection'; // Import HobbiesSection component

const HeroSection: React.FC = () => {
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
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-black text-white text-center relative z-10 overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center py-16">
        {/* Personal Photo */}
        <div ref={photoRef} className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg">
          <Image
            src="https://img8.uploadhouse.com/fileuploads/31936/31936778eb4b70130f3289122781a71f94414143.jpg"
            alt="Angelo照片"
            width={256}
            height={256}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <h1
          ref={titleRef}
          className="font-mono text-6xl md:text-9xl font-bold tracking-tight uppercase mb-8"
          onMouseEnter={handleMouseEnterTitle}
          onMouseLeave={handleMouseLeaveTitle}
        >
          {splitText("Angelo")}
          <br />
          {splitText("Creative Developer")}
        </h1>
        <div ref={bioRef} className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed mb-12">
          <p className="mb-4">
            大學時期的我，在課餘時間擔任過吉他社團老師、咖啡師、以及軟體新創業務。除了喜歡把雜亂的知識收斂成系統後與他人分享，更在實習過程中收穫了很好的簡報/提案/思考能力。而拜於學校重視數據驅動的趨勢，我也培養了不錯的數理能力，也從中發現了用程式解決現實問題的樂趣，因此點燃了我對技術的熱情。除了本科的數理統計/統計分析，更跨系修習了許多程式相關的課程，以展現學習積極/以及學習能力，詳情可以參考<a href="https://drive.google.com/file/d/1rKGg4z_ZxPkvfL82YNfv-tEenXQ0Zn7b/view?usp=share_link" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">我的成績單</a>，也在畢業前與畢業後分別並參與了ccClub/職訓局這兩個非常扎實的coding bootcamp。
          </p>
          <p>
            積極求職的現在，深知轉職軟體工程是一條艱辛、需要持續學習的路程，我積極探索各種技術領域，持續打造能夠真正解決問題的作品集。
          </p>
        </div>
        <div ref={buttonsRef} className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
          <ScrollLink
            to="portfolio"
            smooth={true}
            duration={800}
            className="cursor-pointer px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-lg rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-lg"
          >
            查看作品集
          </ScrollLink>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={800}
            className="cursor-pointer px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-wider text-lg rounded-full hover:bg-white hover:text-black transition-colors duration-300 shadow-lg"
          >
            與我聯繫
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




