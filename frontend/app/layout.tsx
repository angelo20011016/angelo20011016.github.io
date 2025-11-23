"use client";

import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import SideNavigation from "../src/components/layout/SideNavigation";
import Footer from "../src/components/layout/Footer"; // Import Footer component

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
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body>
        <div className="flex bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518625942488-b2a8d5f4c4a4?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop')" }}>
          <div className="absolute inset-0 bg-black opacity-80 z-0"></div> {/* Dark overlay */}
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

