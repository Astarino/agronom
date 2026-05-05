import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["grammy", "@prisma/client", "prisma"],
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
