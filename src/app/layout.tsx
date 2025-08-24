import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LeftDock from '@/components/nav/LeftDock';
// import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

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
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* <ClerkProvider> */}
          <ErrorBoundary>
            <ToastProvider>
              <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
                {/* 左ナビ：画面高固定 */}
                <aside className="hidden md:block sticky top-0 h-[100dvh] overflow-y-auto border-r bg-white">
                  <LeftDock />
                </aside>

                {/* メイン＋フッター（ナビとは独立） */}
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">
                    {children}
                  </main>
                  <footer className="mt-auto border-t bg-white">
                    <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-gray-500">
                      © NeedPort ・ <a href="/legal/terms">利用規約</a> ・ <a href="/legal/privacy">プライバシー</a> ・ <a href="/legal/tokusho">特商法</a>
                    </div>
                  </footer>
                </div>
              </div>
            </ToastProvider>
          </ErrorBoundary>
        {/* </ClerkProvider> */}
      </body>
    </html>
  );
}
