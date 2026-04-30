import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Required for Cloud Run single-Dockerfile deployment */
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
