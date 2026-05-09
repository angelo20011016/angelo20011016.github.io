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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

const introSplashBootScript = `
(() => {
  try {
    const path = window.location.pathname;
    if (path.startsWith("/admin") || path.startsWith("/login")) return;

    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");

    if (localStorage.getItem("angelo:intro-splash-date") !== today) {
      document.documentElement.classList.add("intro-splash-pending");
    }
  } catch {
    document.documentElement.classList.add("intro-splash-pending");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introSplashBootScript }} />
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
