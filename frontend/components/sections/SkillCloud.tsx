"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faServer, faHandshake, faChartLine, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { getSkills, Skill } from '../../services/skillService'; // Import service and type

// Icon map to dynamically render icons based on string from DB
const iconMap = {
  faCode,
  faServer,
  faHandshake,
  faChartLine,
};

const SkillCloud: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const data = await getSkills();
        setSkills(data);
      } catch (err: any) {
        setError("Failed to load skills.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return (
      <div className="mt-20 w-full max-w-5xl text-center">
        <h2 className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">我的技能樹</h2>
        <p className="text-gray-400">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 w-full max-w-5xl text-center">
        <h2 className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">我的技能樹</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-20 w-full max-w-5xl">
      <h2 className="font-mono text-4xl md:text-5xl font-bold mb-12 text-center uppercase">我的技能樹</h2>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 relative z-20">
        {skills.map((category) => (
          <div
            key={category.id}
            className="skill-category relative"
            onMouseEnter={() => setHoveredSkill(category.id!)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <div className="main-skill bg-zinc-800 text-white px-6 py-3 rounded-full font-bold text-lg cursor-pointer transition-all duration-300 flex items-center hover:bg-white hover:text-black group">
              <FontAwesomeIcon 
                icon={iconMap[category.icon] || faQuestionCircle} 
                className="mr-3 text-white group-hover:text-black transition-colors duration-300" 
              />
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
