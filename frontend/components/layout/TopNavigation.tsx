"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";

export default function TopNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center mix-blend-difference"
    >
      <div className="flex items-center space-x-4 group cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-2xl overflow-hidden relative">
           <motion.span 
             className="absolute flex items-center justify-center w-full h-full"
             whileHover={{ y: -48 }}
           >
             A
           </motion.span>
           <motion.span 
             className="absolute flex items-center justify-center w-full h-full translate-y-12"
             whileHover={{ y: 0 }}
           >
             A
           </motion.span>
        </div>
        <div className="text-white font-mono uppercase text-base tracking-[0.2em] overflow-hidden h-6 font-bold">
           <motion.div
             whileHover={{ y: -24 }}
             transition={{ duration: 0.3 }}
           >
             <p className="h-6 flex items-center">Angelo</p>
             <p className="h-6 flex items-center">Code</p>
           </motion.div>
        </div>
      </div>

      <nav className="hidden md:flex space-x-12">
        {["portfolio", "blog", "contact"].map((item) => (
          <ScrollLink
            key={item}
            to={item}
            smooth={true}
            duration={800}
            className="text-white font-mono uppercase text-sm md:text-base tracking-[0.2em] cursor-pointer relative group font-bold"
          >
            {item}
            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </ScrollLink>
        ))}
      </nav>

      {/* Mobile Menu Icon (Placeholder for now) */}
      <div className="md:hidden text-white font-mono uppercase text-base tracking-[0.2em] cursor-pointer font-bold">
        Menu
      </div>
    </motion.header>
  );
}
