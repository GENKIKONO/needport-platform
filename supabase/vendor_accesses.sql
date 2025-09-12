-- vendor_accesses テーブル（PII解放管理）
CREATE TABLE IF NOT EXISTS vendor_accesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL, -- Clerk user id
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  payment_intent_id TEXT,
  deposit_amount INTEGER,
  session_id TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_vendor_accesses_need ON vendor_accesses(need_id);
CREATE INDEX IF NOT EXISTS idx_vendor_accesses_vendor ON vendor_accesses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_accesses_proposal ON vendor_accesses(proposal_id);

-- RLS
ALTER TABLE vendor_accesses ENABLE ROW LEVEL SECURITY;

-- ポリシー：ベンダー自身のアクセス記録のみ閲覧可能
DO $$ BEGIN
  CREATE POLICY "Vendor accesses: read own" ON vendor_accesses
    FOR SELECT USING (
      vendor_id = auth.jwt()->>'sub' OR
      EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.jwt()->>'sub' AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 挿入はシステム（service role）のみ
DO $$ BEGIN
  CREATE POLICY "Vendor accesses: system insert" ON vendor_accesses
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- PII表示判定関数を更新（vendor_accessesを考慮）
CREATE OR REPLACE FUNCTION can_view_pii_enhanced(need_uuid UUID, viewer_id TEXT) 
RETURNS BOOLEAN 
LANGUAGE plpgsql AS $$
DECLARE 
  _is_admin BOOLEAN;
  _has_access BOOLEAN;
BEGIN
  IF viewer_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 管理者判定
  SELECT EXISTS(
    SELECT 1 FROM user_roles
    WHERE user_id = viewer_id AND role = 'admin'
  ) INTO _is_admin;

  IF _is_admin THEN
    RETURN TRUE;
  END IF;

  -- ベンダーアクセス権判定
  SELECT EXISTS(
    SELECT 1 FROM vendor_accesses
    WHERE need_id = need_uuid AND vendor_id = viewer_id
  ) INTO _has_access;

  RETURN _has_access;
END;
$$;

-- 既存の needs_public ビューを更新（PII表示にアクセス権を反映）
DROP VIEW IF EXISTS needs_public_with_access CASCADE;
CREATE VIEW needs_public_with_access AS
SELECT
  n.id,
  n.title,
  n.summary,
  n.region,
  n.category,
  n.created_at,
  n.updated_at,
  n.deadline,
  n.status,
  -- アクセス権がある場合は実際のPII、ない場合はマスク
  CASE 
    WHEN can_view_pii_enhanced(n.id, auth.jwt()->>'sub') 
    THEN n.pii_phone 
    ELSE mask_pii(n.pii_phone) 
  END as pii_phone_display,
  CASE 
    WHEN can_view_pii_enhanced(n.id, auth.jwt()->>'sub') 
    THEN n.pii_email 
    ELSE mask_pii(n.pii_email) 
  END as pii_email_display,
  CASE 
    WHEN can_view_pii_enhanced(n.id, auth.jwt()->>'sub') 
    THEN n.pii_address 
    ELSE mask_pii(n.pii_address) 
  END as pii_address_display,
  -- アクセス権フラグ
  can_view_pii_enhanced(n.id, auth.jwt()->>'sub') as has_pii_access
FROM needs n
WHERE n.status = 'published';