/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for micro frontend deployment
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Enable experimental features
  experimental: {
    externalDir: true,
  },
  
  // Configure headers for CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://admin.yourcompany.com' 
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },

  // API routes for health check and communication
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },

  // Configure for standalone deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure for micro frontend
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Add global variable for micro frontend communication
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'process.env.MICRO_FRONTEND_NAME': JSON.stringify('account-management'),
        })
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;