// UI ラベル管理（B2B 語彙調整用）

const MAP = {
  Offer: { ja: '提案', en: 'Proposal' },
  Adopt: { ja: '採用', en: 'Hire' },
  Supporter: { ja: '賛同者', en: 'Endorser' },
  Entry: { ja: 'エントリー', en: 'Entry' },
  Payment: { ja: '決済', en: 'Payment' },
  ComingSoon: { ja: '近日対応', en: 'Coming Soon' },
  Endorsements: { ja: '賛同', en: 'Endorsements' },
  UnlockProposals: { ja: '提案は賛同が集まると解禁', en: 'Proposals unlock after endorsements' },
  Proposals: { ja: '提案', en: 'Proposals' },
  CompareProposals: { ja: '提案を比較', en: 'Compare proposals' },
  Vendor: { ja: 'ベンダー', en: 'Vendor' },
  Price: { ja: '価格', en: 'Price' },
  Duration: { ja: '期間', en: 'Duration' },
  Deliverables: { ja: '成果物', en: 'Deliverables' },
  Risk: { ja: 'リスク', en: 'Risk' },
  Updated: { ja: '更新', en: 'Updated' },
  NoProposals: { ja: 'まだ提案はありません', en: 'No proposals yet' },
  UnlockAtTen: { ja: '賛同10で提案解禁', en: 'Proposals unlock at 10 endorsements' },
} as const;

export type LabelKey = keyof typeof MAP;

export function label(k: LabelKey, lang: 'ja'|'en' = 'ja') {
  return MAP[k]?.[lang] ?? String(k);
}

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
