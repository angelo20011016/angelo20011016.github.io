"use client";

import { useEffect, useMemo, useState } from "react";
import { getSiteSettings } from "@/services/staticContentService";

const STORAGE_KEY = "angelo:intro-splash-date";
const FALLBACK_KEYWORDS = ["DX", "破格升職", "考績優異"];
const TOTAL_DURATION_MS = 2600;
const MAX_KEYWORDS = 5;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseKeywords(value?: string) {
  const keywords = value
    ?.split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_KEYWORDS);

  return keywords?.length ? keywords : FALLBACK_KEYWORDS;
}

function clearPendingSplash() {
  document.documentElement.classList.remove("intro-splash-pending");
}

export default function DailyKeywordSplash() {
  const todayKey = useMemo(() => getTodayKey(), []);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) !== todayKey;
  });
  const [keywords, setKeywords] = useState(FALLBACK_KEYWORDS);

  useEffect(() => {
    if (!visible) {
      clearPendingSplash();
      return;
    }

    let hideTimer: number | undefined;
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      localStorage.setItem(STORAGE_KEY, todayKey);
      clearPendingSplash();
      setVisible(false);
    };

    hideTimer = window.setTimeout(finish, TOTAL_DURATION_MS);

    const loadSettings = async () => {
      try {
        const settings = await getSiteSettings();
        if (cancelled) return;

        if (!settings.intro_splash_enabled) {
          clearPendingSplash();
          setVisible(false);
          return;
        }

        setKeywords(parseKeywords(settings.intro_splash_keywords));
      } catch (error) {
        console.error("Failed to load intro splash settings:", error);
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
      clearPendingSplash();
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [todayKey, visible]);

  if (!visible) return null;

  const itemDuration = TOTAL_DURATION_MS / Math.max(keywords.length, 1);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-white/20" />
      <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-white/10" />
      <div className="relative h-36 w-full max-w-5xl">
        {keywords.map((keyword, index) => (
          <div
            key={`${keyword}-${index}`}
            className="intro-splash-word absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-[clamp(2.6rem,10vw,8.6rem)] font-semibold uppercase leading-none text-white"
            style={{
              animationDelay: `${index * itemDuration}ms`,
              animationDuration: `${itemDuration + 260}ms`,
            }}
          >
            <span className="intro-splash-word-shell">{keyword}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
