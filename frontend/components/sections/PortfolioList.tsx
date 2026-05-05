"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../services/authService';
import { SiteSettings, getSiteSettings } from '../../services/staticContentService';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  content: string;
  links?: { label: string; url: string }[];
  tags?: string[];
  created_at?: string;
}

function getAssetUrl(url: string): string {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/static/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}${url}`;
}

const PortfolioList: React.FC = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: PortfolioItem[] = await response.json();
        const itemsWithFullImageUrls = data.map(item => ({
          ...item,
          image_url: getAssetUrl(item.image_url)
        }));
        if (isMounted) {
          setPortfolioItems(itemsWithFullImageUrls);
        }
      } catch {
        if (isMounted) {
          setPortfolioItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPortfolio();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load portfolio settings:", err);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl py-20 font-mono text-sm uppercase tracking-[0.22em] text-white/40">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {portfolioItems.length === 0 ? (
        <div className="border border-white/10 p-8 sm:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/35">{settings?.portfolio_empty_eyebrow || "Portfolio library"}</p>
          <h3 className="mt-8 max-w-3xl text-4xl font-bold uppercase leading-tight tracking-normal md:text-6xl">
            {settings?.portfolio_empty_title || "Case studies are ready for your first projects."}
          </h3>
          <p className="mt-6 max-w-2xl leading-8 text-white/60">
            {settings?.portfolio_empty_body || "Add work from the admin panel with a problem, role, process, stack, result, and links. The layout is designed to make each project read like a professional case study."}
          </p>
        </div>
      ) : (
      <div className="flex flex-col border-t border-white/10">
        {portfolioItems.map((item, index) => (
          <Link
            key={item.id}
            href={`/portfolio/${item.id}`}
            className="group relative grid cursor-pointer gap-8 border-b border-white/10 py-10 transition-all duration-500 hover:bg-white hover:px-6 hover:text-black md:grid-cols-[0.12fr_1fr_0.35fr] md:items-center lg:py-12"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <p className="z-10 font-mono text-sm uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 group-hover:text-black/45">
              {String(index + 1).padStart(2, "0")}
            </p>

            <div className="z-10 flex flex-col space-y-4">
              <h3 className="max-w-4xl text-4xl font-bold uppercase leading-[0.95] tracking-normal transition-transform duration-500 group-hover:translate-x-2 md:text-6xl">
                {item.title}
              </h3>
              <p className="max-w-2xl leading-7 text-white/50 transition-colors duration-300 group-hover:text-black/60">
                {item.description}
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/35 transition-colors duration-300 group-hover:text-black/45">
                {item.tags?.join(" / ") || settings?.portfolio_default_tag || "Development"}
              </p>
            </div>
            
            <div className="z-10 flex items-center justify-between gap-6 md:justify-end md:text-right">
              <span className="font-mono text-sm uppercase tracking-[0.18em] text-white/35 transition-colors duration-300 group-hover:text-black/45">
                © {new Date(item.created_at || Date.now()).getFullYear()}
              </span>
              <span className="border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white/50 transition-colors duration-300 group-hover:border-black/20 group-hover:text-black">
                {settings?.portfolio_item_button_label || "View"}
              </span>
            </div>

            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: "20%", rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, x: "0%", rotate: -5 }}
                  exit={{ opacity: 0, scale: 0.8, x: "20%", rotate: 5 }}
                  className="pointer-events-none fixed left-[58%] top-1/2 z-40 hidden h-[420px] w-[320px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm shadow-2xl lg:block"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
};

export default PortfolioList;
