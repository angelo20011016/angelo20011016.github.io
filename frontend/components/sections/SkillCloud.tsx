"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faServer, faHandshake, faChartLine, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { getSkills, Skill } from '../../services/skillService'; // Import service and type
import { SiteSettings, getSiteSettings } from '../../services/staticContentService';

// Icon map to dynamically render icons based on string from DB
const iconMap: Record<string, IconDefinition> = {
  faCode,
  faServer,
  faHandshake,
  faChartLine,
};

const getCategoryDescription = (main: string, settings?: SiteSettings | null) => {
  const categoryCopy: Record<string, string | undefined> = {
    frontend: settings?.skills_frontend_description,
    backend: settings?.skills_backend_description,
    collaboration: settings?.skills_collaboration_description,
    analytics: settings?.skills_analytics_description,
  };
  const key = main.toLowerCase();
  return categoryCopy[key] || settings?.skills_default_description || "Tools and practices used to turn ideas into maintainable shipped work.";
};

const proficiencyByCategory: Record<string, number> = {
  frontend: 92,
  backend: 82,
  collaboration: 76,
  analytics: 68,
};

const getProficiency = (main: string) => {
  const key = main.toLowerCase();
  return proficiencyByCategory[key] ?? 72;
};

const SkillCloud: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coreStack = (settings?.skills_core_stack || "Next.js, React, TypeScript, FastAPI, MongoDB, Docker")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const data = await getSkills();
        setSkills(data);
      } catch (err: unknown) {
        setError("Failed to load skills.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load skills settings:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="skills" className="w-full bg-[#202124] px-5 py-24 text-white sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-white/40">{settings?.skills_eyebrow || "Stack index"}</p>
            <h2 className="text-[clamp(3rem,8vw,7.5rem)] font-bold uppercase leading-[0.9] tracking-normal">
              {settings?.skills_title || "Skills"}
            </h2>
          </div>
          <div className="max-w-3xl lg:justify-self-end">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/35">{settings?.skills_stack_label || "Primary stack"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {coreStack.map((item) => (
                <span key={item} className="border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/[0.72]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <p className="py-16 font-mono text-sm uppercase tracking-[0.2em] text-white/40">Loading skills...</p>
        )}

        {error && (
          <p className="py-16 font-mono text-sm uppercase tracking-[0.2em] text-red-300">{error}</p>
        )}

        {!loading && !error && (
          <div className="mt-10 overflow-hidden border border-white/10 bg-[#1a1b1e]">
            <div className="hidden grid-cols-[minmax(17rem,0.9fr)_minmax(10rem,0.55fr)_minmax(16rem,1fr)_minmax(16rem,0.9fr)] border-b border-white/10 bg-white/[0.025] px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white/35 xl:grid">
              <span>Area</span>
              <span>Level</span>
              <span>Tools</span>
              <span className="text-right">Focus</span>
            </div>
            {skills.map((category, index) => (
              <article
                key={category.id || category.main}
                className="group grid gap-5 border-b border-white/10 p-5 transition-colors duration-300 last:border-b-0 hover:bg-[#26292d] md:grid-cols-[minmax(17rem,1fr)_minmax(12rem,0.7fr)] md:items-center xl:grid-cols-[minmax(17rem,0.9fr)_minmax(10rem,0.55fr)_minmax(16rem,1fr)_minmax(16rem,0.9fr)]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] text-white/55 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/[0.06] group-hover:text-white/75">
                    <FontAwesomeIcon icon={iconMap[category.icon] || faQuestionCircle} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 group-hover:text-white/45">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 whitespace-nowrap text-[clamp(1.45rem,6vw,1.95rem)] font-bold uppercase leading-tight tracking-normal text-white/[0.88] xl:text-3xl">{category.main}</h3>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-white/40 transition-colors duration-300 group-hover:text-white/55">
                    <span>Ready</span>
                    <span>{getProficiency(category.main)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.08] transition-colors duration-300 group-hover:bg-white/[0.12]">
                    <div
                      className="h-full bg-[#9aa7a3] transition-colors duration-300 group-hover:bg-[#b8c4bf]"
                      style={{ width: `${getProficiency(category.main)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-1">
                  {category.subSkills.map((sub) => (
                    <span
                      key={sub}
                      className="max-w-full border border-white/[0.12] bg-white/[0.025] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-white/[0.58] transition-colors duration-300 group-hover:border-white/[0.18] group-hover:bg-white/[0.04] group-hover:text-white/[0.72]"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <p className="max-w-2xl leading-7 text-white/[0.48] transition-colors duration-300 group-hover:text-white/[0.62] md:col-span-2 xl:col-span-1 xl:max-w-sm xl:text-right">
                  {getCategoryDescription(category.main, settings)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillCloud;
