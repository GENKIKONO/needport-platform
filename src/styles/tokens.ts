// 福島サイト準拠のカラートークン
export const COLORS = {
  FUSEN_BAR_BG: "#E6F1F9",
  TAB_PAPER: "#CFE4F7",
  TAB_INACTIVE: "#2C76A6",
  TAB_BORDER: "#2F7CC0",
  CTA_BLUE: "#0B5FA6",
  ICON_BLUE: "#196AA6",
} as const;

// Tailwind用のカスタムカラー（必要に応じて）
export const TAILWIND_COLORS = {
  fusenBarBg: COLORS.FUSEN_BAR_BG,
  tabPaper: COLORS.TAB_PAPER,
  tabInactive: COLORS.TAB_INACTIVE,
  tabBorder: COLORS.TAB_BORDER,
  ctaBlue: COLORS.CTA_BLUE,
  iconBlue: COLORS.ICON_BLUE,
} as const;
