"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../services/authService";
import { getSiteSettings, SiteSettings } from "../../services/staticContentService";

const defaultSettings = {
  about_image_url: "/static/uploads/4e0a62f8-a2e5-4eb8-9f9e-88cb0819e66c.jpg",
  about_eyebrow: "About / Positioning",
  about_title: "Manufacturing AI / DX / Backend Integration Engineer",
  about_summary:
    "Non-CS business background, Python training, and hands-on internal systems work. I connect business process, manufacturing context, automation, AI knowledge bases, permissions, and backend systems.",
  about_body:
    "My strongest value is not only writing code. It is translating real company workflows into usable systems: RAG knowledge bases, CRUD tools, document automation, permission rules, and internal integrations that help teams move faster.",
  about_photo_caption: "Building from business workflow to production-ready system detail",
  stat_1_value: "AI / DX",
  stat_1_label: "Career direction",
  stat_2_value: "Backend",
  stat_2_label: "System foundation",
  stat_3_value: "Manufacturing",
  stat_3_label: "Domain context",
  focus_1_label: "AI / RAG",
  focus_1_title: "Enterprise knowledge systems",
  focus_1_body:
    "Dify, RAG, internal document upload, source citation, department labels, and knowledge workflows for real business users.",
  focus_2_label: "Backend / Security",
  focus_2_title: "Internal systems with permission logic",
  focus_2_body:
    "CRUD systems, JWT, SSO concepts, RBAC, department-level data access, audit logs, and API security as the next engineering threshold.",
  focus_3_label: "DX / Automation",
  focus_3_title: "Workflow automation for manufacturing teams",
  focus_3_body:
    "Announcement crawlers, file conversion, data cleanup, auto-upload pipelines, and cross-department requirement translation.",
};

function getAssetUrl(url: string): string {
  if (!url) return `${API_BASE_URL}${defaultSettings.about_image_url}`;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/static/")) return `${API_BASE_URL}${url}`;
  return url;
}

export default function AboutSection() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>(defaultSettings);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        if (isMounted) {
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error("Failed to load about settings:", error);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const focusAreas = [
    {
      label: settings.focus_1_label || defaultSettings.focus_1_label,
      title: settings.focus_1_title || defaultSettings.focus_1_title,
      body: settings.focus_1_body || defaultSettings.focus_1_body,
    },
    {
      label: settings.focus_2_label || defaultSettings.focus_2_label,
      title: settings.focus_2_title || defaultSettings.focus_2_title,
      body: settings.focus_2_body || defaultSettings.focus_2_body,
    },
    {
      label: settings.focus_3_label || defaultSettings.focus_3_label,
      title: settings.focus_3_title || defaultSettings.focus_3_title,
      body: settings.focus_3_body || defaultSettings.focus_3_body,
    },
  ];

  const stats = [
    [settings.stat_1_value || defaultSettings.stat_1_value, settings.stat_1_label || defaultSettings.stat_1_label],
    [settings.stat_2_value || defaultSettings.stat_2_value, settings.stat_2_label || defaultSettings.stat_2_label],
    [settings.stat_3_value || defaultSettings.stat_3_value, settings.stat_3_label || defaultSettings.stat_3_label],
  ];

  return (
    <section id="about" className="relative w-full overflow-hidden bg-[#f2f0ea] text-[#161719]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-0 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-32">
        <div className="relative order-2 mt-14 min-h-[420px] overflow-hidden rounded-sm lg:order-1 lg:mt-0 lg:min-h-[720px]">
          <Image
            src={getAssetUrl(settings.about_image_url || defaultSettings.about_image_url)}
            alt="Angelo preparing coffee in a kitchen"
            fill
            className="object-cover grayscale contrast-110"
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
          <div className="absolute inset-0 bg-[#161719]/10" />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-5 text-white sm:p-8">
            <p className="max-w-[12rem] font-mono text-xs uppercase leading-relaxed tracking-[0.24em] text-white/80">
              {settings.about_photo_caption || defaultSettings.about_photo_caption}
            </p>
            <span className="font-mono text-sm uppercase tracking-[0.18em] text-white/70">2026</span>
          </div>
        </div>

        <div className="order-1 flex flex-col justify-between gap-16 lg:order-2 lg:pl-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.7 }}
              className="mb-8 font-mono text-sm uppercase tracking-[0.28em] text-black/50"
            >
              {settings.about_eyebrow || defaultSettings.about_eyebrow}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="max-w-4xl text-[clamp(3rem,8vw,7.5rem)] font-bold uppercase leading-[0.9] tracking-normal text-[#161719]"
            >
              {settings.about_title || defaultSettings.about_title}
            </motion.h2>

            <div className="mt-10 grid gap-8 border-t border-black/15 pt-8 lg:grid-cols-[0.75fr_1fr]">
              <p className="font-mono text-sm uppercase leading-relaxed tracking-[0.18em] text-black/45">
                {settings.about_summary || defaultSettings.about_summary}
              </p>
              <p className="text-lg leading-8 text-black/70 md:text-xl md:leading-9">
                {settings.about_body || defaultSettings.about_body}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(([value, label]) => (
              <div key={value} className="border-t border-black/20 pt-5">
                <p className="font-mono text-2xl font-bold uppercase tracking-normal text-[#161719]">{value}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-black/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 px-5 pb-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-0 border-l border-black/10 md:grid-cols-3">
          {focusAreas.map((area, index) => (
            <motion.article
              key={area.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              className="min-h-[280px] border-b border-r border-black/10 p-6 sm:p-8"
            >
              <p className="mb-10 font-mono text-xs uppercase tracking-[0.24em] text-black/45">0{index + 1} / {area.label}</p>
              <h3 className="max-w-sm text-2xl font-bold uppercase leading-tight tracking-normal text-[#161719]">{area.title}</h3>
              <p className="mt-5 leading-7 text-black/60">{area.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
