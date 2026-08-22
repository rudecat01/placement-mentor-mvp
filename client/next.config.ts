import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/roadmap/:path*",
        destination: `${BACKEND_URL}/roadmap/:path*`,
      },
      {
        source: "/onboarding/:path*",
        destination: `${BACKEND_URL}/api/onboarding/:path*`,
      },
      {
        source: "/sandbox/:path*",
        destination: `${BACKEND_URL}/sandbox/:path*`,
      },
      {
        source: "/agents/:path*",
        destination: `${BACKEND_URL}/agents/:path*`,
      },
    ];
  },
};

export default nextConfig;
