"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

const hobbiesData = [
  {
    name: '跑步',
    imageUrl: 'https://img6.uploadhouse.com/fileuploads/31936/31936866e532037a3fc020e252756014fe9fbebf.jpg',
  },
  {
    name: '咖啡',
    imageUrl: 'https://img2.uploadhouse.com/fileuploads/31936/3193686247bb0dd7f71643ea2b64c918032da91b.jpg',
  },
  {
    name: '健身',
    imageUrl: 'https://img8.uploadhouse.com/fileuploads/31937/31937298023d322cb396e779e18f49439d96f45e.png',
  },
  {
    name: '音樂',
    imageUrl: 'https://img3.uploadhouse.com/fileuploads/31936/31936863619a5b492ca7b371d3cec2170e2a415e.jpg',
  },
];

const HobbiesSection: React.FC = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const introTextRef = useRef(null);
  const hobbyCardsRef = useRef<(HTMLDivElement | null)[]>([]);

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
    gsap.fromTo(introTextRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=150',
          toggleActions: 'play none none reverse',
        }
      }
    );
    hobbyCardsRef.current.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 * index + 0.4,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center+=100',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  }, []);

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto flex flex-col items-center py-16 px-8 text-white">
      <h2 ref={titleRef} className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">
        工作之外的我
      </h2>
      <p ref={introTextRef} className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed mb-12 text-center max-w-2xl">
        平時也積極培養其他興趣愛好，相信休息是為了走更長遠的路，也把自律正直視為值得用一生貫徹的價值觀。
        <br />
        未來也計畫分享相關題材的文章，來幫助有興趣但卻不知道如何開始的朋友們，Happy we can!
      </p>      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {hobbiesData.map((hobby, index) => (
          <div
            key={hobby.name}
            ref={el => hobbyCardsRef.current[index] = el}
            className="hobby-card rounded-lg overflow-hidden group cursor-pointer bg-zinc-900 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative w-full h-40 overflow-hidden">
              <Image
                src={hobby.imageUrl}
                alt={hobby.name}
                width={300} // Appropriate width
                height={160} // Adjusted height for 16:9 aspect ratio or similar
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                quality={75}
                priority={false} // Only load if visible
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
              />
            </div>
            <div className="p-4 text-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors duration-300">
              <h3 className="font-mono text-xl font-bold text-white uppercase">
                {hobby.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HobbiesSection;
