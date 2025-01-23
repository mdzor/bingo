import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      // your existing patterns if any
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  /* config options here */
};

export default nextConfig;
