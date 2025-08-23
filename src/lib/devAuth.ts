export interface DevSession {
  userId: string;
  role: 'user' | 'business' | 'admin';
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export function getDevSession(): DevSession | null {
  if (process.env.DEV_ASSUME_AUTH !== '1') {
    return null;
  }

  // 開発時は常にadminとして扱う（全機能テスト用）
  return {
    userId: 'dev-user-123',
    role: 'admin',
    emailVerified: true,
    phoneVerified: true,
  };
}

export function isDevAuthEnabled(): boolean {
  return process.env.DEV_ASSUME_AUTH === '1';
}

// 開発用の仮ユーザー情報
export const DEV_USERS = {
  admin: { id: 'dev-admin-123', role: 'admin' as const },
  business: { id: 'dev-business-456', role: 'business' as const },
  user: { id: 'dev-user-789', role: 'user' as const },
};
