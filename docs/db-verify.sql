-- Need Scale 機能の DB 検証用 SQL
-- 実行して結果を確認してください

-- 1. pg_policies の一覧（needs テーブル）
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'needs'
ORDER BY policyname;

-- 2. need_scale の enum 値
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'need_scale'
ORDER BY e.enumsortorder;

-- 3. idx_needs_scale の存在確認
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'needs' 
  AND indexname = 'idx_needs_scale';

-- 4. 直近の needs 10件の title/scale/published/adopted_offer_id
SELECT 
  id,
  title,
  scale,
  published,
  adopted_offer_id,
  macro_fee_hint,
  macro_use_freq,
  macro_area_hint,
  created_at
FROM needs 
ORDER BY created_at DESC 
LIMIT 10;
