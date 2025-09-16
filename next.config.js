/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for better performance
  images: {
    domains: [
      'localhost', 
      'supabase.co', 
      'jrtctjgdkvkdrjcbbbaz.supabase.co',
      'www.zomiga.live',
      'zomiga.live'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations - simplified to avoid bundling issues
  experimental: {
    // optimizeCss requires the 'critters' package; disable during dev to avoid MODULE_NOT_FOUND
    optimizeCss: false,
    scrollRestoration: true,
  },
  
  // Compression
  compress: true,
  
  // تحسين الأداء العام
  generateEtags: false,
  
  // PWA and mobile optimizations
  poweredByHeader: false,
  
  // Build optimizations
  swcMinify: true,
  
  // Bundle optimization - simplified to avoid function reference issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    
    // Bundle analyzer
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }
    
    return config
  },
  
  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig