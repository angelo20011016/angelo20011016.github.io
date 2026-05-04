import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '8001' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8001' },
    ],
  },
  /* config options here */
};

export default nextConfig;

