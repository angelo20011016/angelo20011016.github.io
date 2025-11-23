"use client";

import React, { useEffect, useState } from 'react';
import { Link as ScrollLink, scroller } from 'react-scroll';

const navItems = [
  { id: 'hero', label: '關於我' },
  { id: 'portfolio', label: '作品集' },
  { id: 'blog', label: '部落格' },
  { id: 'contact', label: '聯絡我' },
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
          // Consider section active if its middle part is in the viewport
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

  const scrollToSection = (id: string) => {
    scroller.scrollTo(id, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
    });
  };

  return (
    <nav className="fixed left-0 top-1/2 -translate-y-1/2 p-4 hidden md:flex flex-col space-y-6 z-50 font-inter"> {/* Using font-inter */}
      {navItems.map((item) => (
        <ScrollLink
          key={item.id}
          to={item.id}
          smooth={true}
          duration={800}
          spy={true}
          onSetActive={() => setActiveSection(item.id)}
          className="relative cursor-pointer group flex items-center"
          onClick={() => scrollToSection(item.id)}
        >
          <span className={`h-0.5 w-4 bg-white mr-3 transition-all duration-300 ${activeSection === item.id ? 'w-8' : 'w-4 group-hover:w-6'}`}></span> {/* Subtle line indicator */}
          <span className={`text-lg font-medium transition-colors duration-300 uppercase
            ${activeSection === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {item.label}
          </span>
        </ScrollLink>
      ))}
    </nav>
  );
};

export default SideNavigation;
