-- docs/sql/needs-engagement-rls.sql
-- Collective Demand Schema and RLS Documentation
-- 注意：本PRはドキュメントのみでDBは変更しない

-- =============================================================================
-- 1. ENUM TYPE
-- =============================================================================

-- 興味・購入意向の種別
CREATE TYPE engagement_kind AS ENUM ('interest', 'pledge');

-- =============================================================================
-- 2. TABLES DDL
-- =============================================================================

-- ユーザー認証済みの興味・購入意向
CREATE TABLE need_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    kind engagement_kind NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 同一ユーザーは同一ニーズ・同一種別で一つのみ（トグル可）
    UNIQUE(need_id, user_id, kind)
);

-- 匿名の「気になる」表明（未ログイン）
CREATE TABLE need_anonymous_interest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
    anon_key TEXT NOT NULL, -- sha256(ip || user_agent || salt)
    day DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- IP+UA+日で一つのみ（日単位重複抑止）
    UNIQUE(need_id, anon_key, day)
);

-- =============================================================================
-- 3. RLS POLICIES
-- =============================================================================

-- need_engagements テーブルの RLS
ALTER TABLE need_engagements ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは挿入可能
CREATE POLICY "Authenticated users can insert engagements"
ON need_engagements FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- 認証済みユーザーは全件読み取り可能（集計用）
CREATE POLICY "Authenticated users can read all engagements"
ON need_engagements FOR SELECT
TO authenticated
USING (true);

-- 匿名ユーザーも集計用に読み取り可能
CREATE POLICY "Anonymous users can read engagement counts"
ON need_engagements FOR SELECT
TO anon
USING (true);

-- need_anonymous_interest テーブルの RLS
ALTER TABLE need_anonymous_interest ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーも挿入可能
CREATE POLICY "Anonymous users can insert interest"
ON need_anonymous_interest FOR INSERT
TO anon
WITH CHECK (true);

-- 認証済みユーザーも挿入可能（統計機能用）
CREATE POLICY "Authenticated users can insert anonymous interest"
ON need_anonymous_interest FOR INSERT
TO authenticated
WITH CHECK (true);

-- 全ユーザー読み取り可能（集計用）
CREATE POLICY "All users can read anonymous interest counts"
ON need_anonymous_interest FOR SELECT
TO anon, authenticated
USING (true);

-- =============================================================================
-- 4. INDEXES
-- =============================================================================

-- パフォーマンス最適化用インデックス
CREATE INDEX idx_need_engagements_need_id ON need_engagements(need_id);
CREATE INDEX idx_need_engagements_user_kind ON need_engagements(user_id, kind);
CREATE INDEX idx_need_anonymous_interest_need_id ON need_anonymous_interest(need_id);
CREATE INDEX idx_need_anonymous_interest_day ON need_anonymous_interest(day);

-- =============================================================================
-- 5. 匿名キー生成について
-- =============================================================================

/*
anon_key生成例（アプリケーション側で実装）:

const crypto = require('crypto');

function generateAnonKey(ip, userAgent) {
    const salt = process.env.ANON_SALT; // 環境変数で秘密の塩
    const payload = ip + userAgent + salt;
    return crypto.createHash('sha256').update(payload).digest('hex');
}

環境変数設定例:
ANON_SALT=your-secret-salt-here-change-in-production

重要：
- IPアドレスやUser-Agentは直接保存せず、ハッシュ化後のみ保存
- 日単位での重複抑止（同日内は同一anon_keyで一回のみ）
- 個人情報（PII）は一切保持しない
*/

-- =============================================================================
-- 6. 実行手順
-- =============================================================================

/*
このファイルは要件定義ドキュメントです。実際のDB変更は別作業で実施してください。

1. Supabase Dashboard または psql で上記SQLを実行
2. 環境変数 ANON_SALT を設定
3. API実装 (POST /api/needs/[id]/engagement, GET /api/needs/[id]/engagement/summary)
4. UI実装 (NeedCard/NeedDetailに二重バー＋カウント表示)
5. E2Eテスト実装
*/