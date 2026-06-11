import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    localPatterns: [
      {
        pathname: "/api/media",
        search: "**",
      },
      {
        pathname: "/**",
        search: "",
      },
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "36.253.137.34",
        port: "8004",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "36.253.137.34",
        port: "8004",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "36.253.137.34",
        port: "8003",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "36.253.137.34",
        port: "8003",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
