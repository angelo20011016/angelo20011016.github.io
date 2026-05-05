"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { SiteSettings, getSiteSettings } from '@/services/staticContentService';

const defaultNavItems = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'portfolio', label: 'Work' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
];

const SideNavigation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const navItems = useMemo(() => (
    settings
      ? [
        { id: 'hero', label: settings.nav_home_label || 'Home', enabled: settings.section_hero_enabled },
        { id: 'about', label: settings.nav_about_label || 'About', enabled: settings.section_about_enabled },
        { id: 'skills', label: settings.nav_skills_label || 'Skills', enabled: settings.section_skills_enabled },
        { id: 'portfolio', label: settings.nav_portfolio_label || 'Work', enabled: settings.section_portfolio_enabled },
        { id: 'blog', label: settings.nav_blog_label || 'Blog', enabled: settings.section_blog_enabled },
        { id: 'contact', label: settings.nav_contact_label || 'Contact', enabled: settings.section_contact_enabled },
      ].filter((item) => item.enabled)
      : defaultNavItems
  ), [settings]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load side navigation settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0, 0.2, 0.45, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  return (
    <nav className="fixed right-8 top-1/2 z-50 hidden -translate-y-1/2 flex-col space-y-5 mix-blend-difference md:flex xl:right-12">
      {navItems.map((item) => (
        <ScrollLink
          key={item.id}
          to={item.id}
          smooth={true}
          duration={800}
          spy={true}
          onSetActive={() => setActiveSection(item.id)}
          className="relative cursor-pointer group flex items-center justify-end"
        >
          <span className={`mr-5 font-mono text-xs font-bold uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:opacity-100 md:text-sm ${activeSection === item.id ? 'translate-x-0 text-white opacity-100' : 'translate-x-2 text-white/40'}`}>
            {item.label}
          </span>
          <div className="relative h-9 w-[2px] overflow-hidden bg-white/15 transition-all duration-500">
             <div className={`absolute left-0 top-0 h-full w-full origin-top bg-white transition-transform duration-500 ${activeSection === item.id ? 'scale-y-100' : 'scale-y-0'}`}></div>
          </div>
        </ScrollLink>
      ))}
    </nav>
  );
};

export default SideNavigation;
