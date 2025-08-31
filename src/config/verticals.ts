export const verticals = {
  default: {
    vendorVisibility: 'anonymous' as const,
    userRevealPolicy: 'paid' as const,
    usesSettlement: true,
  },
  care_taxi: {
    vendorVisibility: 'public' as const,     // 事業者は最初から公開
    userRevealPolicy: 'accepted' as const,   // 承認時にユーザー開示
    usesSettlement: false,                   // 課金フロー無し（将来サブスク導入余地あり）
  }
};
