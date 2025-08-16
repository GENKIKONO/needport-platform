// フラグ管理ユーティリティ（SSR/CSR両対応）

// 既存のフィーチャーフラグ
export const FF_PUBLIC_ENTRY = process.env.FF_PUBLIC_ENTRY !== "false"; // default true
export const FF_NOTIFICATIONS = process.env.FF_NOTIFICATIONS === "true"; // default false
export const FF_PAGINATION = process.env.FF_PAGINATION !== "false"; // default true
export const FF_SENTRY = process.env.FF_SENTRY === "true"; // default false

// B2B 関連フラグ
// 注意: SSR/CSRで評価タイミングが異なる場合があります
export const b2bEnabled = () => process.env.EXPERIMENTAL_B2B === '1';
export const noindexEnabled = () => process.env.NEXT_PUBLIC_SITE_NOINDEX === '1';
export const paymentsEnabled = () => process.env.PAYMENTS_ENABLED === '1';

// 複合フラグ（よく使う組み合わせ）
// 関数合成で明示的に表現（読みやすさ向上）
export const showB2BFeatures = () => b2bEnabled() && noindexEnabled();
