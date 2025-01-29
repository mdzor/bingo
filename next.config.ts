import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  generateBuildId: async () => {
    return Date.now().toString();
  },
  optimizeCss: true,
  images: {
    remotePatterns: [
      // your existing patterns if any
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
