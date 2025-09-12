// Clerkの共通設定
export const CLERK_CONFIG = {
  appearance: {
    elements: {
      formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-sm normal-case',
      card: 'shadow-lg border border-blue-100/50',
      headerTitle: 'text-slate-800',
      headerSubtitle: 'text-slate-600'
    }
  },
  redirectUrl: '/me'
} as const;