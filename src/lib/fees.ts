import { FEE_CONFIG } from '@/config/fees';

export type PaymentMethod = 'card' | 'bank';

export function pickRate(total: number, method: PaymentMethod) {
  const bands = FEE_CONFIG.bands[method];
  for (const b of bands) {
    if (total <= b.max) return b.rate;
  }
  return bands[bands.length - 1].rate;
}

export function ceilToUnit(amount: number, unit = FEE_CONFIG.roundingUnit) {
  return Math.ceil(amount / unit) * unit;
}

/**
 * 入力：人数×単価、支払方法
 * 出力：適用率、マッチングフィー、紹介バッファ、Stripe参考手数料、最終請求額など
 */
export function computeMatchingFee(params: {
  quantity: number;
  unitPrice: number;
  method: PaymentMethod;
}) {
  const { quantity, unitPrice, method } = params;
  const total = Math.max(0, Math.round(quantity * unitPrice)); // 税別想定
  const baseRate = pickRate(total, method);
  const referralPct = FEE_CONFIG.referralPct ?? 0;
  const effectiveRate = baseRate; // 表示上の公称レート

  const feeRaw = total * effectiveRate;
  const referralBuf = Math.floor(total * referralPct); // 参考内訳
  // Stripe原価は card のときだけ参考表示
  const stripeCost = method === 'card' ? Math.floor(feeRaw * FEE_CONFIG.stripeFeeRate) : 0;

  // 最終請求額（事業者が支払うフィー）
  let fee = ceilToUnit(feeRaw);

  return {
    total,                   // 税別の案件金額（人数×単価）
    method,                  // 'card' | 'bank'
    rate: effectiveRate,     // 適用手数料率
    feeRaw,                  // 丸め前
    fee,                     // 丸め後（請求額）
    referralPct,             // 将来還元バッファ％（参考）
    referralBuf,             // 参考バッファ額
    stripeCost,              // 参考Stripeコスト（card時）
  };
}
