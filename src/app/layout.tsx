import './globals.css'
import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import SafeClerkProvider from '@/components/auth/SafeClerkProvider'

export const metadata: Metadata = {
  title: 'NeedPort',
  description: '埋もれた声を、つなぐ。形にする。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeClerkProvider>
      <html lang="ja">
        <body>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </ToastProvider>
        </body>
      </html>
    </SafeClerkProvider>
  )
}