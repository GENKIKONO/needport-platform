const e = process.env;
console.log('=== 環境変数チェック ===');
console.log({
  SUPABASE_URL: !!e.SUPABASE_URL,
  SUPABASE_ANON_KEY: !!e.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE: !!e.SUPABASE_SERVICE_ROLE,
  ADMIN_UI_KEY: !!e.ADMIN_UI_KEY,
  NEXT_PUBLIC_STRIPE_ENABLED: e.NEXT_PUBLIC_STRIPE_ENABLED || '0'
});

console.log('\n=== 本番デプロイ前チェックリスト ===');
console.log('1. Supabase SQL エディタで supabase-migration-phase1.sql を実行');
console.log('2. Vercel 環境変数を確認・設定');
console.log('3. Vercel で Redeploy (Cache OFF)');
console.log('4. E2E スモークテスト実行');

console.log('\n=== 必須環境変数 ===');
console.log('SUPABASE_URL: 本番SupabaseのURL');
console.log('SUPABASE_ANON_KEY: 本番Supabaseの匿名キー');
console.log('SUPABASE_SERVICE_ROLE: 本番Supabaseのサービスロールキー');
console.log('ADMIN_UI_KEY: 管理画面ログイン用の強力なキー');
console.log('NEXT_PUBLIC_SITE_URL: https://needport.jp');
console.log('NEXT_PUBLIC_STRIPE_ENABLED: 0 (後日1に変更)');
