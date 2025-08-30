-- needs拡張
ALTER TABLE needs
  ADD COLUMN IF NOT EXISTS category TEXT,               -- 大分類
  ADD COLUMN IF NOT EXISTS subcategory TEXT,            -- 小分類
  ADD COLUMN IF NOT EXISTS quantity INTEGER,            -- 人数/個数
  ADD COLUMN IF NOT EXISTS unit_price INTEGER,          -- 単価（円）
  ADD COLUMN IF NOT EXISTS desired_start_date DATE,     -- 希望開始日
  ADD COLUMN IF NOT EXISTS desired_end_date DATE,       -- 希望終了日
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',     -- public|members|private
  ADD COLUMN IF NOT EXISTS contact_pref TEXT DEFAULT 'inapp',    -- inapp|email
  ADD COLUMN IF NOT EXISTS disclosure_level TEXT DEFAULT 'summary'; -- summary|details

-- タグ正規化（任意、既存がtext[]ならスキップ）
CREATE TABLE IF NOT EXISTS need_tags (
  need_id uuid REFERENCES needs(id) ON DELETE CASCADE,
  tag TEXT,
  PRIMARY KEY(need_id, tag)
);

-- 事業者プロフィール
CREATE TABLE IF NOT EXISTS vendor_profiles (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  company_kana TEXT,
  website TEXT,
  industries TEXT[],           -- 業種
  service_areas TEXT[],        -- 対応エリア
  portfolio_urls TEXT[],
  contact_email TEXT,
  contact_phone TEXT,
  invoice_qualified BOOLEAN DEFAULT false,  -- 適格請求書発行事業者
  intro TEXT,                                -- 自己紹介/実績
  verification_status TEXT DEFAULT 'unverified' -- unverified|pending|verified
);

-- 提出書類（画像/PDF）
CREATE TABLE IF NOT EXISTS vendor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT,          -- corp_cert|portfolio|other
  file_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS（要：実プロジェクトの既存方針に揃える）
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS vendor_profiles_self_rw ON vendor_profiles
  FOR SELECT USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS vendor_documents_self_rw ON vendor_documents
  FOR SELECT USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- needsの更新は既存ポリシー（作成者のみ更新）を流用
