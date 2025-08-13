-- Need Scale 機能の idempotent マイグレーション
-- 何度実行しても安全

-- 1. need_scale enum の作成（存在しなければ）
DO $$ BEGIN
    CREATE TYPE need_scale AS ENUM ('personal', 'community');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. needs.scale カラムの追加（存在しなければ）
ALTER TABLE needs ADD COLUMN IF NOT EXISTS scale need_scale DEFAULT 'personal';

-- 3. macro フィールドの追加（存在しなければ）
ALTER TABLE needs ADD COLUMN IF NOT EXISTS macro_fee_hint TEXT;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS macro_use_freq TEXT;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS macro_area_hint TEXT;

-- 4. published の default false を明示（既に設定済みでもOK）
ALTER TABLE needs ALTER COLUMN published SET DEFAULT false;

-- 5. idx_needs_scale インデックスの作成（存在しなければ）
CREATE INDEX IF NOT EXISTS idx_needs_scale ON needs(scale);

-- 6. RLS ポリシーの更新
-- 既存の同名ポリシーを削除
DROP POLICY IF EXISTS "Users can insert draft needs" ON needs;
DROP POLICY IF EXISTS "Users can view published needs" ON needs;

-- INSERT ポリシー: ドラフトのみ許可
CREATE POLICY "allow_insert_draft_on_needs" ON needs
  FOR INSERT WITH CHECK (
    coalesce(published, false) = false 
    AND adopted_offer_id IS NULL 
    AND (scale IS NULL OR scale IN ('personal'::need_scale, 'community'::need_scale))
  );

-- SELECT ポリシー: 公開済みのみ許可
CREATE POLICY "anon read published needs" ON needs
  FOR SELECT USING (published = true);

-- 7. PostgREST にスキーマ再読み込みを通知
NOTIFY pgrst, 'reload schema';

-- 8. コメント追加
COMMENT ON COLUMN needs.scale IS 'Type of need: personal (individual) or community (group)';
COMMENT ON COLUMN needs.macro_fee_hint IS 'Fee hint for community needs (max 120 chars)';
COMMENT ON COLUMN needs.macro_use_freq IS 'Usage frequency hint for community needs (max 120 chars)';
COMMENT ON COLUMN needs.macro_area_hint IS 'Area hint for community needs (max 120 chars)';
