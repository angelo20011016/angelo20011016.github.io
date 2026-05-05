"use client";

import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AppShell from "@/components/layout/AppShell";

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
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
