import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  webpack(config: any, { dev }: { dev: boolean }) {
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
};
export default nextConfig;
