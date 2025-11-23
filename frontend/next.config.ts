import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  /* config options here */
};

export default nextConfig;

