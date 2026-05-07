"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AppShell from "@/components/layout/AppShell";

gsap.registerPlugin(ScrollTrigger);

export default function RootShell({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
