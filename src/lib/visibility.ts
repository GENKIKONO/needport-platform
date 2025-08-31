export type RevealLevel = 'anonymous' | 'named' | 'contact';
export function resolveRevealLevel(p: { proposalStatus?: string; settlementStatus?: string }): RevealLevel {
  if (p?.settlementStatus === 'paid') return 'contact';
  if (p?.proposalStatus === 'accepted') return 'named';
  return 'anonymous';
}

// 匿名IDフォーマット：User#XXXX（ClerkのuserId末尾から生成）
export function formatAnonId(userId?: string) {
  if (!userId) return 'User#0000';
  const tail = userId.replace(/[^A-Za-z0-9]/g, '').slice(-4).padStart(4, '0');
  return `User#${tail}`;
}
