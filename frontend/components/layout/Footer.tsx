"use client";

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background text-gray-500 py-12 px-8 flex flex-col md:flex-row justify-between items-center border-t border-white/10 relative z-10 font-mono text-[10px] uppercase tracking-widest">
      <div className="flex flex-col md:flex-row items-center md:space-x-12 space-y-4 md:space-y-0">
        <p>© 2026 Angelo — Created with Passion</p>
        <p>Built with Next.js & GSAP</p>
      </div>
      
      <div className="flex space-x-8 mt-8 md:mt-0">
        <a href="https://www.instagram.com/angelo__1016/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
          Instagram
        </a>
        <a href="https://github.com/angeloange?tab=repositories" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
          GitHub
        </a>
        <a href="https://www.youtube.com/@Happywecan" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
          YouTube
        </a>
      </div>
    </footer>
  );
};

export default Footer;
