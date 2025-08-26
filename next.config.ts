import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Server external packages
  serverExternalPackages: ['@anthropic-ai/sdk']
};

export default nextConfig;
