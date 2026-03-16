import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' as const } : {}),
  transpilePackages: [
    '@shofferai/shared',
    '@shofferai/agent-core',
  ],
  // Keep ws and bufferutil as native Node modules — standalone bundler breaks them
  serverExternalPackages: ['ws', 'bufferutil', 'utf-8-validate'],
};

export default nextConfig;
