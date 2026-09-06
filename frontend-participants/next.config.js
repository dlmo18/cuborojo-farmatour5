/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Configure for proper asset serving behind nginx proxy
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Ensure proper handling of static files
  staticPageGenerationTimeout: 60,
  // Disable automatic static optimization errors
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog'],
  },
}

module.exports = nextConfig
