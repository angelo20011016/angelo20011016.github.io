"use client";

import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/common/SmoothScroll";
import TopNavigation from "@/components/layout/TopNavigation";
import SideNavigation from "@/components/layout/SideNavigation";
import CustomCursor from "@/components/common/CustomCursor";
import DailyKeywordSplash from "@/components/common/DailyKeywordSplash";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (isAdminRoute) {
    return (
      <div className="min-h-screen cursor-auto">
        {children}
      </div>
    );
  }

  return (
    <SmoothScroll>
      <DailyKeywordSplash />
      <CustomCursor />
      <div className="relative flex min-h-screen cursor-none flex-col">
        <TopNavigation />
        <SideNavigation />
        <main className="relative z-10 flex-grow">
          {children}
        </main>
      </div>
    </SmoothScroll>
  );
}
