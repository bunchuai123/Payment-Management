import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://paymentpro-production.up.railway.app'
      : 'http://localhost:8001'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  generateBuildId: async () => {
    return 'payment-management-build'
  }
};

export default nextConfig;
