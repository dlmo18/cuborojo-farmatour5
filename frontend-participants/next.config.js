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
  // Permitir imágenes del API backend
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
      process.env.NEXT_PUBLIC_API_URL?.replace('http://', '').replace('https://', '').split(':')[0] || 'localhost',
    ].filter(Boolean),
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
