"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons'; // Import all icons
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
    const icon = (SolidIcons as any)[iconName];
    return icon || SolidIcons.faQuestionCircle;
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-8 text-white flex flex-col items-center">
      <ScrollReveal className="w-full flex justify-center">
        <h2 className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">
          工作之外的我
        </h2>
      </ScrollReveal>

      <ScrollReveal className="w-full flex justify-center" delay={0.2}>
        <div className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed mb-16 text-center max-w-2xl">
          <p className="mb-6">
            平時也積極培養其他興趣愛好，相信休息是為了走更長遠的路，也把自律正直視為值得用一生貫徹的價值觀。
          </p>
          <p>
            未來也計畫分享相關題材的文章，來幫助有興趣但卻不知道如何開始的朋友們，Happy we can!
          </p>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="text-gray-500">Loading hobbies...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
          {hobbies.length > 0 ? (
              hobbies.map((hobby, index) => (
                <ScrollReveal key={hobby.id || index} delay={0.3 + (index * 0.1)} className="flex flex-col items-center group w-full">
                  <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-white group-hover:text-black shadow-lg cursor-pointer">
                    <FontAwesomeIcon icon={getIcon(hobby.icon)} className="text-3xl text-gray-300 group-hover:text-black transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">{hobby.name}</h3>
                  {hobby.description && (
                      <span className="text-xs text-gray-500 text-center">{hobby.description}</span>
                  )}
                </ScrollReveal>
              ))
          ) : (
             <div className="col-span-full text-center text-gray-500">暫無興趣資料</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HobbiesSection;
