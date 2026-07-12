import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  // three.js ships untranspiled ESM examples; keep it isolated to the home chunk.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
