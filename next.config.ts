import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.wizlab.io.vn',
        port: '',
        pathname: '/sop/**',
      },
      // Add other potential image domains
      {
        protocol: 'https',
        hostname: 'sop.wizlab.io.vn',
        port: '',
        pathname: '/**',
      },
    ],
    // Add unoptimized option for development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
