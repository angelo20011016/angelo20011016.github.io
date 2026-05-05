"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons'; // Import all icons
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { getHobbies, Hobby } from '../../services/hobbyService';
import { ScrollReveal } from '../common/ScrollReveal';

const HobbiesSection: React.FC = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHobbies();
        setHobbies(data);
      } catch (error) {
        console.error("Failed to fetch hobbies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get icon object from string name
  const getIcon = (iconName: string) => {
    const icon = SolidIcons[iconName as keyof typeof SolidIcons];
    return (icon || SolidIcons.faQuestionCircle) as IconDefinition;
  };

  return (
    <section id="hobbies" className="w-full bg-background px-5 pb-24 text-white sm:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal>
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-white/40">Outside work</p>
              <h2 className="text-[clamp(2.75rem,7vw,6.5rem)] font-bold uppercase leading-[0.92] tracking-normal">
                Built by more than code.
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="max-w-2xl text-lg leading-8 text-white/60 md:text-xl md:leading-9">
              <p className="mb-6">
                工作之外的興趣是網站裡很重要的人味：它讓作品集不只展示技能，也展示你如何學習、維持節奏、累積長期輸出。
              </p>
              <p>
                之後這裡可以延伸到文章主題，像是自律、健身、咖啡、攝影或生活紀錄，讓技術內容旁邊有更完整的個人輪廓。
              </p>
            </div>
          </ScrollReveal>
        </div>

        {loading ? (
          <div className="py-16 font-mono text-sm uppercase tracking-[0.2em] text-white/40">Loading hobbies...</div>
        ) : (
          <div className="mt-16 grid border-l border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {hobbies.length > 0 ? (
              hobbies.map((hobby, index) => (
                <ScrollReveal
                  key={hobby.id || index}
                  delay={0.2 + index * 0.06}
                  className="group min-h-[240px] border-b border-r border-white/10 p-6 transition-colors duration-300 hover:bg-[#f2f0ea] hover:text-black sm:p-8"
                >
                  <div className="mb-10 flex items-start justify-between">
                    <FontAwesomeIcon
                      icon={getIcon(hobby.icon)}
                      className="text-2xl text-white/50 transition-colors duration-300 group-hover:text-black/60"
                    />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 group-hover:text-black/40">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold uppercase leading-tight tracking-normal">{hobby.name}</h3>
                  {hobby.description && (
                    <p className="mt-5 leading-7 text-white/50 transition-colors duration-300 group-hover:text-black/60">
                      {hobby.description}
                    </p>
                  )}
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-full border-b border-r border-white/10 p-8 font-mono text-sm uppercase tracking-[0.2em] text-white/35">
                暫無興趣資料
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HobbiesSection;
