export const FLAGS = {
  UI_V2_DEFAULT: true,
  DISABLE_STRIPE_CAPTURE: true, // 決済は画面までで止める
  ENFORCE_CANONICAL: true,
  CANONICAL_HOST: (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim(), // ex: needport.jp
};
