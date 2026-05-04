import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   remotePatterns: [new URL("https://media.twenty-print.com/**")],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.twenty-print.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
