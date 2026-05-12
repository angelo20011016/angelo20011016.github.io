"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import Image from "next/image";
import { SiteSettings, getSiteSettings } from "@/services/staticContentService";

const defaultNavItems = [
  { id: "about", label: "about" },
  { id: "skills", label: "skills" },
  { id: "portfolio", label: "portfolio" },
  { id: "blog", label: "blog" },
  { id: "contact", label: "contact" },
];

export default function TopNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const navItems = settings
    ? [
        { id: "about", label: settings.nav_about_label || "about", enabled: settings.section_about_enabled },
        { id: "skills", label: settings.nav_skills_label || "skills", enabled: settings.section_skills_enabled },
        { id: "portfolio", label: settings.nav_portfolio_label || "portfolio", enabled: settings.section_portfolio_enabled },
        { id: "blog", label: settings.nav_blog_label || "blog", enabled: settings.section_blog_enabled },
        { id: "contact", label: settings.nav_contact_label || "contact", enabled: settings.section_contact_enabled },
      ].filter((item) => item.enabled)
    : defaultNavItems;

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load navigation settings:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible || isMenuOpen ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-[100] flex w-full items-center justify-between px-5 py-5 mix-blend-difference sm:px-8"
      >
        <ScrollLink to="hero" smooth={true} duration={800} className="group flex cursor-pointer items-center space-x-4">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white">
            <Image
              src="/icon.png"
              alt="Angelo logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </div>
          <div className="h-6 overflow-hidden font-mono text-sm font-bold uppercase tracking-[0.2em] text-white sm:text-base">
            <motion.div
              whileHover={{ y: -24 }}
              transition={{ duration: 0.3 }}
            >
              <p className="flex h-6 items-center">{settings?.nav_brand_primary || "Angelo"}</p>
              <p className="flex h-6 items-center">{settings?.nav_brand_secondary || "Studio"}</p>
            </motion.div>
          </div>
        </ScrollLink>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <ScrollLink
              key={item.id}
              to={item.id}
              smooth={true}
              duration={800}
              className="group relative cursor-pointer font-mono text-sm font-bold uppercase tracking-[0.18em] text-white"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
            </ScrollLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[90] bg-[#161719] px-5 pb-8 pt-28 text-white md:hidden"
          >
            <nav className="flex h-full flex-col justify-between">
              <div className="flex flex-col border-t border-white/10">
                {navItems.map((item, index) => (
                  <ScrollLink
                    key={item.id}
                    to={item.id}
                    smooth={true}
                    duration={800}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex cursor-pointer items-center justify-between border-b border-white/10 py-6"
                  >
                    <span className="text-4xl font-bold uppercase tracking-normal">{item.label}</span>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                      0{index + 1}
                    </span>
                  </ScrollLink>
                ))}
              </div>
              <p className="max-w-xs font-mono text-xs uppercase leading-relaxed tracking-[0.22em] text-white/40">
                {settings?.nav_mobile_caption || "Product-minded frontend, full-stack implementation, and writing from Taiwan."}
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
