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
