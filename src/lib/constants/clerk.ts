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
  redirectUrl: '/me',
  // セッション持続設定
  sessionOptions: {
    sessionTokenTemplate: 'supabase',
    // 30日間セッションを保持
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  }
} as const;