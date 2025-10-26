import withPWA from "next-pwa";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  reactCompiler: true,
};

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwa(baseConfig);
