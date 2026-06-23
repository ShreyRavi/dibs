import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin file-tracing to this project — a stray lockfile in $HOME otherwise makes
  // Next infer the wrong workspace root (breaks Vercel build traces).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
