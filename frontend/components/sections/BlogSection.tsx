"use client";

import React, { useEffect, useState } from 'react';
import DetailModal from '../common/DetailModal';
import { motion } from 'framer-motion';

interface BlogPostItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  content?: string;
  tags?: string[];
  published_at?: string;
  cover_image?: string;
  subtitle?: string;
}

const BlogSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BlogPostItem | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/blog?publishedOnly=true');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: BlogPostItem[] = await response.json();
        const formattedData = data.map(post => ({
          ...post,
          imageUrl: post.imageUrl || post.cover_image,
          description: post.description || post.subtitle,
        }));
        setBlogPosts(formattedData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  if (loading) return null;

  return (
    <section id="blog" className="min-h-screen w-full flex flex-col pt-32 pb-20 bg-background text-white px-8">
      <div className="mask-reveal mb-20">
         <motion.h2 
           initial={{ y: "100%" }}
           whileInView={{ y: "0%" }}
           transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
           className="text-[10vw] font-mono font-bold uppercase tracking-tighter leading-none"
         >
           Insights
         </motion.h2>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col border-t border-white/10">
        {blogPosts.map((post, index) => (
          <div
            key={post.id}
            onClick={() => {
              setSelectedItem(post);
              setIsModalOpen(true);
            }}
            className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-white/10 cursor-pointer transition-all duration-300 hover:px-4"
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-12">
               <span className="text-white/60 font-mono text-base uppercase tracking-widest">
                 {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'MAY 01'}
               </span>
               <h3 className="text-4xl md:text-6xl font-mono font-bold uppercase tracking-tighter group-hover:text-primary transition-colors">
                 {post.title}
               </h3>
            </div>
            
            <div className="mt-4 md:mt-0">
               <span className="text-white/80 font-mono text-sm uppercase tracking-widest border border-white/40 px-6 py-3 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                 Read More
               </span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem.title}
          image={selectedItem.imageUrl}
          description={selectedItem.description}
          content={selectedItem.content}
          tags={selectedItem.tags}
          date={selectedItem.published_at}
        />
      )}
    </section>
  );
};

export default BlogSection;
