import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Traces only the files used by the app → tiny Docker image
};

export default nextConfig;
