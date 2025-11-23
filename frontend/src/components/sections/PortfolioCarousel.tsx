"use client";

import React, { useState, useEffect } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css'; // Default theme for Splide
import DetailModal from '../common/DetailModal'; // Import DetailModal
import Image from 'next/image';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  content: string;
  links?: { label: string; url: string }[];
  tags?: string[];
  created_at?: string;
}

const PortfolioCarousel: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/portfolio');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PortfolioItem[] = await response.json();
        setPortfolioItems(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const splideOptions = {
    type: 'loop',
    perPage: 1,
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    height: 'min(70vh, 700px)',
    arrows: true,
    pagination: true,
    wheel: false,
    classes: {
      arrows: 'splide__arrows your-class-arrows',
      arrow : 'splide__arrow your-class-arrow',
      prev  : 'splide__arrow--prev your-class-prev',
      next  : 'splide__arrow--next your-class-next',
      pagination: 'splide__pagination your-class-pagination',
      page    : 'splide__pagination__page your-class-page',
    },
  };

  const openModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (loading) {
    return <div className="text-white text-center py-12">載入作品集中...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-12">錯誤: {error}</div>;
  }

  if (portfolioItems.length === 0) {
    return <div className="text-gray-400 text-center py-12">目前沒有作品。</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-12">
      <Splide options={splideOptions} aria-label="我的作品集">
        {portfolioItems.map((item, index) => (
          <SplideSlide key={item.id || index}>
            <div
              className="relative w-full h-full bg-cover bg-center flex items-center justify-center p-8 md:p-16 text-white"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              <div className="relative z-10 text-center max-w-3xl">
                <h3 className="font-mono text-4xl md:text-6xl font-bold mb-4 uppercase text-shadow-lg">
                  {item.title}
                </h3>
                <p className="font-inter text-lg md:text-xl text-gray-200 mb-8">
                  {item.description}
                </p>
                <button
                  onClick={() => openModal(item)}
                  className="inline-block px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 transition-colors duration-300"
                >
                  查看詳情
                </button>
              </div>
            </div>
          </SplideSlide>
        ))}
      </Splide>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedItem.title}
          image={selectedItem.imageUrl}
          description={selectedItem.description}
          content={selectedItem.content}
          links={selectedItem.links}
          tags={selectedItem.tags}
        />
      )}
    </div>
  );
};

export default PortfolioCarousel;
