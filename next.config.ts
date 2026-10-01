import type { NextConfig } from "next";

// Shared hostings (e.g. Beget) cap the number of processes/threads per account, and
// `next build` spawns one worker per CPU core by default. NEXT_BUILD_CPUS lets the
// hosting build script pin the worker count (see `npm run build:hosting`).
const buildCpus = Number(process.env.NEXT_BUILD_CPUS);

const nextConfig: NextConfig = {
  experimental: Number.isInteger(buildCpus) && buildCpus > 0 ? { cpus: buildCpus } : {},
};

export default nextConfig;
