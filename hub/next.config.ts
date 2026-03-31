// hub/next.config.ts
import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['@chenglou/pretext'],
  experimental: {
    turbo: {
      resolveAlias: {
        '@pretext': path.resolve(__dirname, '../pretext/src/layout.ts'),
      },
    },
  },
  webpack(config) {
    config.resolve.alias['@pretext'] = path.resolve(__dirname, '../pretext/src/layout.ts')
    return config
  },
}

export default nextConfig
