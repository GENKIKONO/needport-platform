export const FLAGS = {
  UI_V2_DEFAULT: true,                 // ルートを /v2 に寄せる
  DISABLE_STRIPE_CAPTURE: true,        // 決済はチェックアウトで停止（成約確定しない）
  ENFORCE_CANONICAL: true,             // 本番ドメインへ 301
  CANONICAL_HOST: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "", //  needport.jp
};
