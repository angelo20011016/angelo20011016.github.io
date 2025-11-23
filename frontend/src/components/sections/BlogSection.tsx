"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import DetailModal from '../common/DetailModal'; // Import DetailModal
import Image from 'next/image';

interface BlogPostItem {
  id: string;
  title: string;
  description?: string; // Subtitle from backend
  imageUrl?: string; // cover_image from backend (renamed to imageUrl for consistency)
  content?: string;
  tags?: string[];
  published_at?: string; // published_at from backend (renamed to date for consistency)
}

const BlogSection: React.FC = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]); // Ref for individual cards for animation

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BlogPostItem | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/blog?publishedOnly=true'); // Fetch only published posts
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: BlogPostItem[] = await response.json();
        // Map backend data fields to frontend model for consistency
        const formattedData = data.map(post => ({
          ...post,
          imageUrl: post.imageUrl || post.cover_image, // Use imageUrl or fallback to cover_image
          date: post.published_at, // Map published_at to date
          description: post.description || post.subtitle, // Use description or fallback to subtitle
        }));
        setBlogPosts(formattedData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  useEffect(() => {
    // GSAP animation for the title
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center+=200',
          toggleActions: 'play none none reverse',
        }
      }
    );

    // GSAP animation for individual cards (only if not loading/error and items exist)
    if (!loading && !error && blogPosts.length > 0) {
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, y: 50 },
            {
              opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 * index,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top center+=100',
                toggleActions: 'play none none reverse',
              }
            }
          );
        }
      });
    }
  }, [loading, error, blogPosts]); // Rerun animation effect when data changes

  const openModal = (item: BlogPostItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (loading) {
    return <div className="text-white text-center py-12">載入部落格文章中...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-12">錯誤: {error}</div>;
  }

  if (blogPosts.length === 0) {
    return <div className="text-gray-400 text-center py-12">目前沒有部落格文章。</div>;
  }

  return (
    <section ref={sectionRef} id="blog" className="min-h-screen w-full flex flex-col items-center justify-center p-8 md:p-16 bg-black text-white">
      <h2 ref={titleRef} className="font-mono text-5xl md:text-7xl font-bold mb-16 tracking-wide">
        我的部落格
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        {blogPosts.map((post, index) => (
          <div
            key={post.id || `blog-post-${index}`} // 【修正點】: 如果 post.id 不存在，則使用 index 作為後備鍵
            ref={el => { cardsRef.current[index] = el; }}
            onClick={() => openModal(post)}
            className="group cursor-pointer relative overflow-hidden rounded-lg shadow-lg bg-zinc-900 hover:shadow-xl transition-all duration-300"
          >
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={post.imageUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800'} // Fallback image
                alt={post.title}
                layout="fill"
                objectFit="cover"
                className="transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="p-6">
              <h3 className="font-mono text-2xl font-bold mb-2 group-hover:text-gray-200 transition-colors duration-300">
                {post.title}
              </h3>
              <p className="font-inter text-gray-400 text-sm mb-4">
                {post.description}
              </p>
              <p className="font-inter text-gray-500 text-xs uppercase tracking-wider">
                {post.published_at} {/* Display published_at */}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedItem.title}
          image={selectedItem.imageUrl}
          description={selectedItem.description}
          content={selectedItem.content}
          tags={selectedItem.tags}
          date={selectedItem.published_at} // Pass published_at to modal
        />
      )}
    </section>
  );
};

export default BlogSection;