import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Expose the deployed commit SHA to the client (footer version).
  env: {
    NEXT_PUBLIC_COMMIT:
      process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT || "dev",
  },
  // Pin file-tracing to this project — a stray lockfile in $HOME otherwise makes
  // Next infer the wrong workspace root (breaks Vercel build traces).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
