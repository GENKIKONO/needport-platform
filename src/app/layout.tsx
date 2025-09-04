import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/a11y.css";
import SiteHeader from "./(ui2)/_layout/SiteHeader";
import SiteFooter from "./(ui2)/_layout/SiteFooter";
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeedPort - ニーズとオファーをつなぐプラットフォーム",
  description: "地域のニーズと事業者をマッチングするプラットフォーム",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* === SEO & perf minimal === */}
        <link rel="canonical" href="https://needport.jp/" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="font-display" content="swap" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="dns-prefetch" href="//fonts.googleapis.com"/>
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ClerkProvider>
          <ErrorBoundary>
            <ToastProvider>
              <SiteHeader />
              <main id="main" className="container-page">{children}</main>
              <SiteFooter />
              <Analytics />
            </ToastProvider>
          </ErrorBoundary>
        </ClerkProvider>
      </body>
    </html>
  );
}
