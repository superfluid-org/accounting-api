import type { NextConfig } from "next";

const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  env: {
    APP_URL: appUrl,
  },
  async rewrites() {
    return [
      {
        source: "/api-docs.yaml",
        destination: "/api/api-docs",
      },
      {
        source: "/v1/:path*",
        destination: "/api/:path*",
      },
    ];
  }
};

export default nextConfig;
