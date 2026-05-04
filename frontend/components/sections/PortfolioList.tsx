"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import DetailModal from '../common/DetailModal';
import { API_BASE_URL } from '../../services/authService';

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
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (loading) return <div className="text-white text-center py-20 font-mono uppercase tracking-widest">Loading Projects...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col border-t border-white/10">
        {portfolioItems.map((item, index) => (
          <div
            key={item.id}
            className="group relative flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-white/10 cursor-pointer transition-all duration-500 hover:px-8"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              setSelectedItem(item);
              setIsModalOpen(true);
            }}
          >
            <div className="flex flex-col space-y-2 z-10">
              <h3 className="text-4xl md:text-7xl font-mono font-bold uppercase tracking-tighter group-hover:translate-x-4 transition-transform duration-500">
                {item.title}
              </h3>
              <p className="text-gray-500 font-mono text-sm uppercase tracking-widest group-hover:translate-x-4 transition-transform duration-500 delay-75">
                {item.tags?.join(" / ") || "Development"}
              </p>
            </div>
            
            <div className="text-right hidden md:block z-10">
              <span className="text-gray-500 font-mono text-lg transition-colors duration-300 group-hover:text-white">
                © {new Date(item.created_at || Date.now()).getFullYear()}
              </span>
            </div>

            {/* Hover Image Reveal */}
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: "20%", rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, x: "0%", rotate: -5 }}
                  exit={{ opacity: 0, scale: 0.8, x: "20%", rotate: 5 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] pointer-events-none z-0 overflow-hidden rounded-lg shadow-2xl"
                  style={{ zIndex: -1 }}
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
          </div>
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem.title}
          image={selectedItem.image_url}
          description={selectedItem.description}
          content={selectedItem.content}
          links={selectedItem.links}
          tags={selectedItem.tags}
        />
      )}
    </div>
  );
};

export default PortfolioList;
