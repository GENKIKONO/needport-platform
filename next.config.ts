import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const baseConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  /* 既存の設定はそのまま */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "needport.jp", pathname: "/**" },
    ],
  },
  headers: async () => ([
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://vercel.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://vercel.live https://vercel.com; frame-src 'self' https://vercel.live https://vercel.com;" },
      ]
    }
  ])
};

export default withBundleAnalyzer(baseConfig);

// added by script: canonicalize /v2 -> /
export async function redirects() {
  return [
    { source: '/v2', destination: '/', permanent: true },
    { source: '/v2/:path*', destination: '/:path*', permanent: true },
  ];
}
