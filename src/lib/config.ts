// MVP設定フラグ管理
// ゲスト表示・会員表示の切り替え、MVPモードの制御

export const config = {
  // 表示モード
  GUEST_VIEW: true,        // ゲスト表示（要約＋伏字）
  MVP_MODE: true,          // MVPモード（外部API無効）
  
  // 機能フラグ
  ENABLE_PAYMENT_UI: true, // 決済UI表示
  ENABLE_PII_MASK: true,   // PII伏字化
  ENABLE_DIFF_VIEW: true,  // 差分表示
  
  // デバッグ
  DEBUG_MODE: false,       // デバッグログ出力
};

// 会員状態の取得（モック）
export function getMembershipStatus() {
  return {
    isGuest: config.GUEST_VIEW,
    isUserMember: !config.GUEST_VIEW,
    isProMember: false,
  };
}
