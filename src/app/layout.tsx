import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import ToastShip from '@/components/ToastShip';
import DemoWatermark from "@/components/DemoWatermark";
import SeoJsonLd from "@/components/SeoJsonLd";
import PwaPrompt from "@/components/PwaPrompt";
import { headers } from "next/headers";
import { makeNonce } from "@/lib/security/nonce";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from '@/components/ErrorBoundary';
import ClientErrorCatcher from '@/components/ClientErrorCatcher';
import { Analytics } from '@vercel/analytics/react';
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeedPort - ニーズが出発点の新しい経済",
  description: "人々の生活から生まれるリアルなニーズが、集まり、共鳴し、形になり、地方にも、全国にも、世界にも新しい価値を生む。",
  keywords: "ニーズ, クラウドファンディング, 地方創生, 高知県",
  authors: [{ name: "NeedPort Team" }],
  creator: "NeedPort",
  publisher: "NeedPort",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://needport.jp"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NeedPort - ニーズが出発点の新しい経済",
    description: "人々の生活から生まれるリアルなニーズが、集まり、共鳴し、形になり、地方にも、全国にも、世界にも新しい価値を生む。",
    url: "https://needport.jp",
    siteName: "NeedPort",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeedPort - ニーズが出発点の新しい経済",
    description: "人々の生活から生まれるリアルなニーズが、集まり、共鳴し、形になり、地方にも、全国にも、世界にも新しい価値を生む。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = makeNonce();
  
  return (
    <html lang="ja" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NeedPort" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192.png" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta httpEquiv="Content-Security-Policy" content={`default-src 'self'; base-uri 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';`} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />
        <style dangerouslySetInnerHTML={{ __html: `:root { --page-bottom-safe: 96px; }` }} />
        
        {/* Search Console verification */}
        {process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION} />
        )}
        
        {/* GA4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        
        {/* Skip link for accessibility */}
        <a href="#content" className="skip-link">
          メインコンテンツにスキップ
        </a>
        
        {/* CSP nonce for inline scripts */}
        <script nonce={nonce} dangerouslySetInnerHTML={{
          __html: `
            // Register service worker
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `
        }} />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen pb-[96px]`}>
        <ErrorBoundary>
          <ClientErrorCatcher />
          <ToastProvider>
            <AppHeader />
            {/* メインコンテンツにスキップリンク（フォーカス時のみ表示） */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:text-sm"
            >
              メインコンテンツにスキップ
            </a>
            {/* コンテンツ領域：下ナビとノッチに負けない余白 */}
            <div 
              id="main-content"
              className="min-h-screen pb-24 md:pb-0 [padding-bottom:env(safe-area-inset-bottom)]" 
              style={{ paddingBottom: 'var(--page-bottom-safe)' }}
            >
              {children}
            </div>
            {process.env.NEXT_PUBLIC_DISABLE_BOTTOMNAV === '1' ? null : <BottomNav />}
            
            {/* PWA Install Prompt */}
            <PwaPrompt />
            
            {/* Demo Watermark */}
            <DemoWatermark />
            
            {/* SEO JSON-LD for home page */}
            <SeoJsonLd type="home" />
            
            {/* 投稿成功の港アニメ */}
            <ToastShip />
            
            {/* Vercel Analytics */}
            <Analytics />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
