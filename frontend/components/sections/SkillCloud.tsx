"use client";

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faServer, faHandshake, faChartLine } from '@fortawesome/free-solid-svg-icons';

const skillsData = [
  {
    id: 'frontend',
    icon: faCode,
    main: '前端開發',
    subSkills: ['HTML/CSS', 'JavaScript', 'TailwindCSS', '響應式設計'],
  },
  {
    id: 'backend',
    icon: faServer,
    main: '後端開發',
    subSkills: ['Python', 'Flask', 'MongoDB/MySQL', 'RESTful API', 'EventLet'],
  },
  {
    id: 'business',
    icon: faHandshake,
    main: '業務能力',
    subSkills: ['提案技巧', '簡報製作', '商業/競品分析', '陌生開發', '客戶維護'],
  },
  {
    id: 'data',
    icon: faChartLine,
    main: '數據分析',
    subSkills: ['統計分析', '資料視覺化', '機器學習', '數據解讀'],
  },
];

const SkillCloud: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div className="mt-20 w-full max-w-5xl">
      <h2 className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">我的技能樹</h2>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 relative z-20">
        {skillsData.map((category) => (
          <div
            key={category.id}
            className="skill-category relative"
            onMouseEnter={() => setHoveredSkill(category.id)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <div className="main-skill bg-zinc-800 text-white px-6 py-3 rounded-full font-bold text-lg cursor-pointer transition-all duration-300 flex items-center hover:bg-white hover:text-black">
              <FontAwesomeIcon icon={category.icon} className="mr-3 text-white group-hover:text-black transition-colors duration-300" />
              {category.main}
            </div>
            {hoveredSkill === category.id && (
              <div className="sub-skills absolute flex flex-wrap gap-2 justify-center bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg animate-fade-in"
                   style={{ top: 'calc(100% + 15px)', left: '50%', transform: 'translateX(-50%)', minWidth: '200px' }}>
                {category.subSkills.map((sub, idx) => (
                  <span key={idx} className="sub-skill bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                    {sub}
                  </span>
                ))}
                {/* Arrow for tooltip-like effect */}
                <div className="absolute w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-zinc-900"
                     style={{ top: '-8px', left: '50%', transform: 'translateX(-50%)' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillCloud;
