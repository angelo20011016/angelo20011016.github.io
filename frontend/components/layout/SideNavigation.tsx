"use client";

import React, { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'portfolio', label: 'Work' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
];

const SideNavigation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = '';
      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = item.id;
            break;
          }
        }
      }
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  return (
    <nav className="fixed right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col space-y-6 z-50">
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
          <span className={`text-xs md:text-sm font-mono uppercase tracking-[0.2em] mr-6 transition-all duration-300 opacity-0 group-hover:opacity-100 font-bold ${activeSection === item.id ? 'opacity-100 text-white translate-x-0' : 'text-white/40 translate-x-2'}`}>
            {item.label}
          </span>
          <div className={`h-12 w-[2px] bg-white/10 transition-all duration-500 relative overflow-hidden`}>
             <div className={`absolute top-0 left-0 w-full h-full bg-white transition-transform duration-500 origin-top ${activeSection === item.id ? 'scale-y-100' : 'scale-y-0'}`}></div>
          </div>
        </ScrollLink>
      ))}
    </nav>
  );
};

export default SideNavigation;
