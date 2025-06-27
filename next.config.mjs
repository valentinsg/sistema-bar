/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuraciones específicas para Vercel
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Optimizaciones para API routes
  async headers() {
    return [
      {
        source: '/api/contador/sse',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ]
  },
}

export default nextConfig
