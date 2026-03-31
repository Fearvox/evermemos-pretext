// hub/next.config.ts
import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['@chenglou/pretext'],
  turbopack: {
    // Root must include the pretext submodule directory so Turbopack can
    // resolve the @pretext alias which points outside hub/.
    root: path.resolve(__dirname, '..'),
    resolveAlias: {
      '@pretext': '@chenglou/pretext',
    },
  },
  webpack(config) {
    config.resolve.alias['@pretext'] = path.resolve(__dirname, '../pretext/src/layout.ts')
    return config
  },
}

export default nextConfig
