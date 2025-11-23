import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img8.uploadhouse.com' },
      { protocol: 'https', hostname: 'img6.uploadhouse.com' },
      { protocol: 'https', hostname: 'img2.uploadhouse.com' },
      { protocol: 'https', hostname: 'img3.uploadhouse.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'd22po4pjz3o32e.cloudfront.net' },
      { protocol: 'https', hostname: 'images.chinatimes.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  /* config options here */
};

export default nextConfig;

