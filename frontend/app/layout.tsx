"use client";

import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import SideNavigation from "@/components/layout/SideNavigation";
import Footer from "@/components/layout/Footer"; // Import Footer component

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
      <body>
        <div className="flex min-h-screen relative overflow-x-hidden">
           {/* Aurora Background */}
          <div className="aurora-bg">
            <div className="aurora-blob-1"></div>
            <div className="aurora-blob-2"></div>
            <div className="aurora-blob-3"></div>
          </div>
          
          <SideNavigation />
          <main className="flex-grow relative z-10">
            {children}
            <Footer /> {/* Integrated Footer */}
          </main>
        </div>
      </body>
    </html>
  );
}

