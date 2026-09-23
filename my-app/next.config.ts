import { BASE_PATH } from "./config/base-path";
import type { NextConfig } from "next";

const basePath = BASE_PATH;

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
