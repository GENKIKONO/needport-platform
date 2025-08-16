/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 性能・セキュリティ強化
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "needport.jp",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  // 開発時は eval を使わない sourcemap に変更（unsafe-eval を使いたくない場合）
  webpack(config, { dev, isServer }) {
    if (dev) {
      config.devtool = "source-map";
    }
    
    // 本番ビルド時に開発用APIを除外
    if (!dev) {
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['src/app/api/dev'] = false;
    }
    
    return config;
  },
  // Bundle analyzer
  ...(process.env.ANALYZE === "true" && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            reportFilename: "bundle-analysis.html",
          })
        );
      }
      return config;
    },
  }),
  
  // 無限リダイレクト対策: リダイレクトを明示的に無効化
  async redirects() {
    console.log('redirects() called - returning empty array (disabled)');
    return [];
  },
  
  // 無限リダイレクト対策: リライトを明示的に無効化
  async rewrites() {
    console.log('rewrites() called - returning empty array (disabled)');
    return [];
  },

  // Security headers
  async headers() {
    const isReportOnly = process.env.FF_CSP_REPORT_ONLY === 'true';
    const cspHeader = isReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: cspHeader,
            value: cspValue
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
