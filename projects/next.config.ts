import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['*.dev.coze.site'],
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_COZE_SUPABASE_URL: process.env.COZE_SUPABASE_URL,
    NEXT_PUBLIC_COZE_SUPABASE_ANON_KEY: process.env.COZE_SUPABASE_ANON_KEY,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      zlib: false,
    };
    return config;
  },
};

export default nextConfig;
