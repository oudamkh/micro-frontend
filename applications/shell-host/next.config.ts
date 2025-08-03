/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for micro frontends
  experimental: {
    externalDir: true,
  },
  
  // Configure rewrites to proxy micro frontend requests
  async rewrites() {
    return [
      {
        source: '/mfe/account-management/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
  
  // Configure headers for CORS and micro frontend communication
  async headers() {
    return [
      {
        source: '/mfe/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
  
  // Allow external images and resources
  images: {
    domains: ['localhost'],
  },
  
  // Webpack configuration for dynamic imports
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;