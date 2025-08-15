// UI ラベル管理（B2B 語彙調整用）

export const UI_LABELS = {
  // 既存（個人向け）
  personal: {
    offer: 'オファー',
    adoption: '採択',
    supporter: '支援者',
    entry: 'エントリー',
    payment: '決済',
  },
  
  // B2B 向け
  b2b: {
    offer: '提案',
    adoption: '採用',
    supporter: '賛同者',
    entry: '提案書',
    payment: '契約金',
  }
} as const;

// フィーチャーフラグによる表示切り替え
export function getLabels(isB2B: boolean = false) {
  return isB2B ? UI_LABELS.b2b : UI_LABELS.personal;
}

// 決済関連の表示制御
export function shouldShowPayments(): boolean {
  return process.env.PAYMENTS_ENABLED === '1';
}

// 決済関連の代替表示
export function getPaymentLabel(): string {
  return shouldShowPayments() ? '決済' : '近日対応';
}

// B2B 機能の表示制御
export function isB2BEnabled(): boolean {
  return process.env.EXPERIMENTAL_B2B === '1';
}
