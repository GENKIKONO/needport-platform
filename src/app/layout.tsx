import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'NeedPort',
  description: '埋もれた声を、つなぐ。形にする。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}