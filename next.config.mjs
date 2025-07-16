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
  // Configuraciones para resolver warnings de dependencias
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Suprimir warnings específicos de Supabase Realtime
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false

    return config
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
