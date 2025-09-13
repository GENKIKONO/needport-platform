import './globals.css'
import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as HotToaster } from 'react-hot-toast'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'NeedPort',
  description: '埋もれた声を、つなぐ。形にする。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
            <HotToaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  fontSize: '14px',
                },
              }}
            />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}