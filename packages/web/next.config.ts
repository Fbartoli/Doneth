import type { NextConfig } from "next";
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config: Configuration, { isServer }) => {
    // Ensure plugins array exists
    config.plugins = config.plugins || [];

    config.resolve!.fallback = { fs: false, net: false, tls: false };

    // Ignore pino-pretty module warnings
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /^pino-pretty$/,
        contextRegExp: /pino\/lib$/,
      }),
    );
    return config;
  },
};

export default nextConfig;
