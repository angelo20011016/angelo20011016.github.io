import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";

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

export const metadata: Metadata = {
  title: {
    default: "Angelo Developer",
    template: "%s | Angelo Developer",
  },
  description: "Angelo's portfolio, blog, skills, and contact site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
