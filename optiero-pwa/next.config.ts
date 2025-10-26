import withPWA from "next-pwa";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      // add more hosts later if needed
      // { protocol: "https", hostname: "your-cdn.example.com", pathname: "/**" },
    ],
  },
};

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwa(baseConfig);
