import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.NEXT_PUBLIC_ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
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

export default withBundleAnalyzer(nextConfig);