export const FEE_CONFIG = {
  referralPct: 0.02, // 将来の紹介還元バッファ（とりあえず2%想定、0でもOK）
  roundingUnit: 1000, // 最終金額の丸め単位（¥1,000）
  bands: {
    card: [
      { max: 100_000, rate: 0.10 },
      { max: 500_000, rate: 0.09 },
      { max: Infinity, rate: 0.08 },
    ],
    bank: [
      { max: 100_000, rate: 0.09 },
      { max: 500_000, rate: 0.08 },
      { max: Infinity, rate: 0.07 },
    ],
  },
  stripeFeeRate: 0.036, // 参考表示用（収益内訳の可視化用）
};

/**
 * 業種ごとの課金ポリシー決定（industries.fee_applicable=false を優先）
 * - fee_applicable=false の場合：決済/手数料UIを隠し、承認→開示で進める（care_taxiと同等運用）
 * - true の場合：既存の default ポリシー（決済で開示など）を利用
 */
export function resolveFeePolicy(industry: { fee_applicable: boolean } | null | undefined) {
  if (!industry) return { usesSettlement: true, revealPolicy: 'paid' as const };
  if (industry.fee_applicable === false) {
    return { usesSettlement: false, revealPolicy: 'accepted' as const };
  }
  return { usesSettlement: true, revealPolicy: 'paid' as const };
}
