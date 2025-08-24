import { UserRole } from '@/lib/auth/roles';

export interface TabConfig {
  key: string;
  label: string;
  icon?: string;
}

export const tabsForRole: Record<UserRole, TabConfig[]> = {
  general: [
    { key: 'deals', label: '取引' },
    { key: 'payments', label: '支払い' },
    { key: 'chats', label: 'チャット' },
    { key: 'posts', label: '投稿' },
    { key: 'applications', label: '応募' },
    { key: 'profile', label: 'プロフィール' },
    { key: 'security', label: 'セキュリティ' },
    { key: 'support', label: 'サポート' },
  ],
  vendor: [
    { key: 'deals', label: '取引' },
    { key: 'payments', label: '支払い' },
    { key: 'chats', label: 'チャット' },
    { key: 'offers', label: '提案管理' },
    { key: 'profile', label: '企業情報' },
    { key: 'security', label: 'セキュリティ' },
    { key: 'support', label: 'サポート' },
  ],
  admin: [
    { key: 'deals', label: '取引' },
    { key: 'payments', label: '支払い' },
    { key: 'chats', label: 'チャット' },
    { key: 'posts', label: '投稿' },
    { key: 'applications', label: '応募' },
    { key: 'offers', label: '提案管理' },
    { key: 'profile', label: 'プロフィール' },
    { key: 'security', label: 'セキュリティ' },
    { key: 'support', label: 'サポート' },
  ],
};

// 各タブの権限制御
export const allowedRolesForTab: Record<string, UserRole[]> = {
  deals: ['general', 'vendor', 'admin'],
  payments: ['general', 'vendor', 'admin'],
  chats: ['general', 'vendor', 'admin'],
  posts: ['general', 'admin'],
  applications: ['general', 'admin'],
  offers: ['vendor', 'admin'],
  profile: ['general', 'vendor', 'admin'],
  security: ['general', 'vendor', 'admin'],
  support: ['general', 'vendor', 'admin'],
};

// プロフィールタブのラベル取得
export function getProfileLabel(role: UserRole): string {
  return role === 'vendor' ? '企業情報' : 'プロフィール';
}
