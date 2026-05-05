"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../services/authService';
import { SiteSettings, getSiteSettings } from '../../services/staticContentService';

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

function getAssetUrl(url?: string): string | undefined {
  if (!url || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

const BlogSection: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load site settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blog?publishedOnly=true`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: BlogPostItem[] = await response.json();
        const formattedData = data.map(post => ({
          ...post,
          imageUrl: getAssetUrl(post.imageUrl || post.cover_image),
          description: post.description || post.subtitle,
        }));
        if (isMounted) {
          setBlogPosts(formattedData);
        }
      } catch {
        if (isMounted) {
          setBlogPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlogPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return null;

  return (
    <section id="blog" className="min-h-screen w-full bg-[#f2f0ea] px-5 py-24 text-[#161719] sm:px-8 lg:py-32">
      <div className="mx-auto mb-16 grid max-w-7xl gap-10 border-b border-black/10 pb-12 lg:grid-cols-[1fr_0.85fr] lg:items-end">
        <div className="mask-reveal">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            className="text-[clamp(3.4rem,9vw,9rem)] font-mono font-bold uppercase leading-[0.9] tracking-normal"
          >
            {settings?.blog_title || "Insights"}
          </motion.h2>
        </div>
        <p className="max-w-xl text-lg leading-8 text-black/60 lg:justify-self-end lg:text-right">
          {settings?.blog_subtitle || "A place for technical notes, product decisions, and personal operating principles. Start with fewer articles, but make each one worth keeping."}
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        {blogPosts.length === 0 ? (
          <div className="border border-black/10 p-8 sm:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/40">{settings?.blog_empty_eyebrow || "Journal system"}</p>
            <h3 className="mt-8 max-w-3xl text-4xl font-bold uppercase leading-tight tracking-normal md:text-6xl">
              {settings?.blog_empty_title || "The writing shelf is ready."}
            </h3>
            <p className="mt-6 max-w-2xl leading-8 text-black/60">
              {settings?.blog_empty_body || "Use the admin panel to publish long-form notes. Good first topics: this website build, Docker development workflow, FastAPI API design, and MongoDB content modeling."}
            </p>
          </div>
        ) : (
          <div className="grid border-l border-black/10 md:grid-cols-2">
            {blogPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group flex min-h-[360px] cursor-pointer flex-col justify-between border-b border-r border-black/10 p-6 transition-colors duration-300 hover:bg-[#161719] hover:text-white sm:p-8"
              >
                <div>
                  <div className="mb-12 flex items-center justify-between gap-8">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-black/40 transition-colors duration-300 group-hover:text-white/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-black/40 transition-colors duration-300 group-hover:text-white/40">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : settings?.blog_draft_label || 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold uppercase leading-tight tracking-normal md:text-5xl">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="mt-6 leading-7 text-black/60 transition-colors duration-300 group-hover:text-white/60">
                      {post.description}
                    </p>
                  )}
                </div>

                <div className="mt-12 flex items-center justify-between gap-6">
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="border border-black/15 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-black/45 transition-colors duration-300 group-hover:border-white/20 group-hover:text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-black/45 transition-colors duration-300 group-hover:text-white">
                    {settings?.blog_item_button_label || "Read"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
