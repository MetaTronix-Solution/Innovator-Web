import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "36.253.137.34",
        port: "8005",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
