import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'img8.uploadhouse.com',
      'img6.uploadhouse.com',
      'img2.uploadhouse.com',
      'img3.uploadhouse.com',
      'images.unsplash.com',
      'd22po4pjz3o32e.cloudfront.net',
      'images.chinatimes.com', // 【關鍵修正】: 錯誤中提到的域名
      'images.unsplash.com',   // 【關鍵修正】: 您的備用圖片的域名
    ], // Add your image domains here
  },
  /* config options here */
};

export default nextConfig;
