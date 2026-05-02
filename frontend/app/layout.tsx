"use client";

import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "@/components/common/SmoothScroll";
import TopNavigation from "@/components/layout/TopNavigation";
import SideNavigation from "@/components/layout/SideNavigation";
import CustomCursor from "@/components/common/CustomCursor";
import Footer from "@/components/layout/Footer";

gsap.registerPlugin(ScrollTrigger);

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white cursor-none">
        <SmoothScroll>
          <CustomCursor />
          <div className="flex flex-col min-h-screen relative">
            <TopNavigation />
            <SideNavigation />
            <main className="flex-grow relative z-10">
              {children}
            </main>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}

