import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import ToastShip from '@/components/ToastShip';
import DemoWatermark from "@/components/DemoWatermark";
import SeoJsonLd from "@/components/SeoJsonLd";
import PwaPrompt from "@/components/PwaPrompt";
import { headers } from "next/headers";
import { makeNonce } from "@/lib/security/csp";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from '@/components/ErrorBoundary';
import ClientErrorCatcher from '@/components/ClientErrorCatcher';
import { Analytics } from '@vercel/analytics/react';
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "NeedPort - ニーズとオファーをつなぐプラットフォーム",
  description: "NeedPortは、企業のニーズとベンダーのオファーを効率的にマッチングするプラットフォームです。",
  keywords: "ニーズ, オファー, マッチング, ビジネス, プラットフォーム",
  authors: [{ name: "NeedPort" }],
  creator: "NeedPort",
  publisher: "NeedPort",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://needport.jp"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NeedPort - ニーズとオファーをつなぐプラットフォーム",
    description: "企業のニーズとベンダーのオファーを効率的にマッチング",
    url: "/",
    siteName: "NeedPort",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeedPort - ニーズとオファーをつなぐプラットフォーム",
    description: "企業のニーズとベンダーのオファーを効率的にマッチング",
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
        <meta name="theme-color" content="#111827" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        
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
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <ErrorBoundary>
          <ClientErrorCatcher />
          <ToastProvider>
            <AppHeader />
            {/* コンテンツ領域：下ナビとノッチに負けない余白 */}
            <div className="min-h-screen pb-24 md:pb-0 [padding-bottom:env(safe-area-inset-bottom)]" style={{ paddingBottom: 'var(--page-bottom-safe)' }}>
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
