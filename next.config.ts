import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from "next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",

};

export default bundleAnalyzer(nextConfig);
