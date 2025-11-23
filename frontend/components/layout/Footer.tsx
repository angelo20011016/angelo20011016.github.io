"use client";

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-gray-500 py-6 mt-12 text-center relative z-10">
      <div className="container mx-auto flex flex-col items-center space-y-4">
        <div className="flex space-x-6">
          <a href="https://www.instagram.com/angelo__1016/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
            IG
          </a>
          <a href="https://github.com/angeloange?tab=repositories" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
            GitHub
          </a>
          <a href="https://www.youtube.com/@Happywecan" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
            YouTube
          </a>
        </div>
        <p>&copy; 2025 Angeloange. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
