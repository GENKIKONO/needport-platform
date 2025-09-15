# ニーズ投稿完全運用システム要件定義書

**バージョン:** 2.0  
**作成日:** 2025-09-15  
**対象フェーズ:** MVP拡張 - 完全CRUD + リアクション + 自動アーカイブ

## 1. 機能要件

### 1.1 投稿（Needs）運用の完成

#### 1.1.1 ユーザー権限別操作
**ユーザー本人（投稿者）**
- ✅ 自分の投稿の一覧表示（下書き/公開/アーカイブ含む）
- ✅ 新規投稿作成（status: 'draft' 初期値）
- ✅ 自分の投稿編集（タイトル・本文・カテゴリ・公開設定）
- ✅ 自分の投稿削除（論理削除推奨）
- ✅ 公開/下書き切り替え

**管理者**
- ✅ 全投稿の閲覧（フィルタ・検索機能付き）
- ✅ 投稿凍結（公開停止、status: 'frozen'）
- ✅ 投稿削除（物理削除権限）
- ✅ 手動アーカイブ操作
- ✅ 監査ログ閲覧（誰が・いつ・何を実行）

**未ログイン・他ユーザー**
- ✅ 公開投稿の閲覧のみ（status: 'published'）
- ❌ 編集・削除・管理操作は一切不可

#### 1.1.2 公開設定・ステータス管理
```typescript
enum NeedStatus {
  DRAFT = 'draft',      // 下書き（投稿者のみ表示）
  PUBLISHED = 'published', // 公開中（全員表示）
  FROZEN = 'frozen',    // 凍結（管理者により非公開）
  ARCHIVED = 'archived' // アーカイブ（会員専用ページのみ）
}
```

### 1.2 リアクション（トグル）システム

#### 1.2.1 リアクション種類
```typescript
enum ReactionKind {
  WANT_TO_BUY = 'WANT_TO_BUY',     // 購入したい
  INTERESTED = 'INTERESTED'        // 興味あり
}
```

#### 1.2.2 トグル機能
- **同一ユーザー + 同一投稿 + 同一種類** = ユニーク制約
- **押下動作**: 未反応 → 反応追加、既反応 → 反応削除
- **UI表示**: リアクション状態のON/OFF表示
- **集計表示**: 各種類の合計数をリアルタイム表示

#### 1.2.3 将来拡張性
- 新しいリアクション種類の追加が容易
- 既存データに影響しない設計
- 集計パフォーマンスの最適化対応

### 1.3 公開期間の自動制御

#### 1.3.1 60日自動アーカイブ
- **条件**: `published_at` から60日経過
- **処理**: `status: 'archived'`、`archived_at` タイムスタンプ設定
- **実行**: GitHub Actions CRON（日次実行）
- **対象URL**: `/needs/archive`（認証ユーザーのみアクセス可）

#### 1.3.2 アーカイブ後の動作
- 一般公開ページ（`/needs`）から除外
- 検索結果から除外
- 会員専用アーカイブページでのみ閲覧可能
- リアクション・チャット機能は維持

### 1.4 匿名性の確保

#### 1.4.1 一般ユーザー間
- **氏名・メールアドレス**: 完全非表示
- **表示名**: `display_name`（ニックネーム）または匿名ID
- **プロフィール制限**: 個人特定可能情報の除外

#### 1.4.2 管理者画面
- **既定状態**: 個人情報マスク表示（`****@****.com`形式）
- **明示操作**: 「詳細表示」ボタンクリックで一時的に実名表示
- **監査ログ**: 個人情報閲覧操作も記録

### 1.5 チャットの永続性
- **既定動作**: 全チャットメッセージは永続保存
- **削除制限**: 自動削除・一括削除機能を無効化
- **管理者権限**: 明示的な削除操作のみ許可（監査ログ記録）

## 2. データモデル

### 2.1 needs テーブル（拡張）
```sql
-- 既存カラム維持
id, owner_id, title, body, status, published, created_at

-- 追加カラム
published_at TIMESTAMP WITH TIME ZONE,  -- 公開開始日時
archived_at TIMESTAMP WITH TIME ZONE,   -- アーカイブ日時
display_title TEXT,                     -- 表示用タイトル（検索最適化）
```

### 2.2 need_reactions テーブル（新規）
```sql
CREATE TABLE need_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('WANT_TO_BUY', 'INTERESTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(need_id, user_id, kind)  -- トグル実現のための制約
);

-- インデックス
CREATE INDEX idx_need_reactions_need_id ON need_reactions(need_id);
CREATE INDEX idx_need_reactions_user_id ON need_reactions(user_id);
CREATE INDEX idx_need_reactions_kind ON need_reactions(kind);
```

### 2.3 profiles テーブル（拡張）
```sql
-- 追加カラム
display_name TEXT,                      -- 表示用ニックネーム
is_admin BOOLEAN DEFAULT FALSE,         -- 管理者フラグ
anonymity_level TEXT DEFAULT 'standard' -- 匿名レベル設定
```

### 2.4 audit_logs テーブル（新規/拡張）
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,                  -- CREATE, UPDATE, DELETE, FREEZE, ARCHIVE, VIEW_PII
  resource_type TEXT NOT NULL,           -- needs, profiles, need_reactions
  resource_id UUID,
  old_values JSONB,                      -- 変更前データ
  new_values JSONB,                      -- 変更後データ
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 権限・RLS（Row Level Security）

### 3.1 needs テーブル RLS
```sql
-- 公開投稿は全員閲覧可、下書き・アーカイブは所有者・管理者のみ
CREATE POLICY "needs_select_policy" ON needs FOR SELECT USING (
  status = 'published' OR 
  owner_id = auth.uid()::UUID OR 
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND is_admin = true)
);

-- 作成は認証ユーザーのみ、owner_idはサーバーサイドで強制設定
CREATE POLICY "needs_insert_policy" ON needs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND owner_id = auth.uid()::UUID
);

-- 更新・削除は所有者または管理者のみ
CREATE POLICY "needs_update_policy" ON needs FOR UPDATE USING (
  owner_id = auth.uid()::UUID OR 
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND is_admin = true)
);

CREATE POLICY "needs_delete_policy" ON needs FOR DELETE USING (
  owner_id = auth.uid()::UUID OR 
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND is_admin = true)
);
```

### 3.2 need_reactions テーブル RLS
```sql
-- 自分のリアクション + 集計情報は閲覧可
CREATE POLICY "reactions_select_policy" ON need_reactions FOR SELECT USING (
  user_id = auth.uid()::UUID OR 
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND is_admin = true)
);

-- リアクションは認証ユーザーのみ、自分のIDで強制作成
CREATE POLICY "reactions_insert_policy" ON need_reactions FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()::UUID
);

-- 自分のリアクションのみ削除可能
CREATE POLICY "reactions_delete_policy" ON need_reactions FOR DELETE USING (
  user_id = auth.uid()::UUID
);
```

### 3.3 profiles テーブル RLS（匿名性対応）
```sql
-- 自分のプロフィールはフル表示、他者は匿名フィールドのみ
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (
  id = auth.uid()::UUID OR 
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND is_admin = true)
);

-- 匿名表示用ビュー
CREATE VIEW profiles_public AS 
SELECT 
  id,
  display_name,
  created_at,
  -- メール・氏名は除外
  CASE 
    WHEN display_name IS NOT NULL THEN display_name
    ELSE CONCAT('ユーザー', SUBSTRING(id::TEXT, 1, 8))
  END as public_name
FROM profiles
WHERE id != auth.uid()::UUID;  -- 自分以外のプロフィール
```

## 4. API 仕様

### 4.1 Needs CRUD API
```typescript
// POST /api/needs - 新規作成
interface CreateNeedRequest {
  title: string;
  body: string;
  category: string;
  status?: 'draft' | 'published'; // デフォルト: 'draft'
}

// PATCH /api/needs/[id] - 更新
interface UpdateNeedRequest {
  title?: string;
  body?: string;
  category?: string;
  status?: 'draft' | 'published';
}

// DELETE /api/needs/[id] - 削除（所有者・管理者のみ）
```

### 4.2 Reactions API
```typescript
// POST /api/needs/[id]/reactions - トグル
interface ToggleReactionRequest {
  kind: 'WANT_TO_BUY' | 'INTERESTED';
}

interface ToggleReactionResponse {
  action: 'added' | 'removed';
  current_state: boolean;
  total_count: number;
}

// GET /api/needs/[id]/reactions/summary - 集計
interface ReactionSummary {
  want_to_buy_count: number;
  interested_count: number;
  user_reactions: {
    want_to_buy: boolean;
    interested: boolean;
  };
}
```

### 4.3 Admin API
```typescript
// POST /api/admin/needs/[id]/freeze - 凍結
// POST /api/admin/needs/[id]/archive - 手動アーカイブ
// GET /api/admin/needs - 全投稿管理
// GET /api/admin/audit-logs - 監査ログ閲覧
```

### 4.4 セキュリティ実装
```typescript
// 所有権検証ミドルウェア
async function verifyOwnership(needId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('needs')
    .select('owner_id')
    .eq('id', needId)
    .single();
  
  return data?.owner_id === userId;
}

// トランザクション実装例（リアクショントグル）
async function toggleReaction(needId: string, userId: string, kind: ReactionKind) {
  const { data, error } = await supabase.rpc('toggle_reaction', {
    p_need_id: needId,
    p_user_id: userId,
    p_kind: kind
  });
  return { data, error };
}
```

## 5. バックグラウンド運用

### 5.1 60日アーカイブジョブ
```typescript
// scripts/jobs/archive-stale-needs.ts
export async function archiveStaleNeeds() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);
  
  const { data: staleNeeds } = await supabase
    .from('needs')
    .select('id, title, owner_id')
    .eq('status', 'published')
    .is('archived_at', null)
    .lte('published_at', cutoffDate.toISOString());
  
  for (const need of staleNeeds || []) {
    await supabase
      .from('needs')
      .update({ 
        status: 'archived', 
        archived_at: new Date().toISOString() 
      })
      .eq('id', need.id);
    
    // 監査ログ記録
    await logAuditAction('ARCHIVE', 'needs', need.id, 'system');
  }
}
```

### 5.2 GitHub Actions CRON
```yaml
# .github/workflows/archive-stale-needs.yml
name: Archive Stale Needs
on:
  schedule:
    - cron: '0 1 * * *'  # 毎日1:00 JST実行
  workflow_dispatch:
  
jobs:
  archive:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run jobs:archive-stale-needs
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 5.3 RLS設定ドリフト防止
```typescript
// scripts/ci/verify-rls-snapshot.ts
export async function verifyRLSSnapshot() {
  const currentPolicies = await getCurrentRLSPolicies();
  const expectedPolicies = await loadExpectedPolicies();
  
  const diff = compareRLSPolicies(currentPolicies, expectedPolicies);
  
  if (diff.length > 0) {
    console.error('RLS Policy drift detected:', diff);
    process.exit(1);
  }
}
```

## 6. UI/UX 設計

### 6.1 投稿管理ページ（/me/needs）
```typescript
interface MyNeedsPageProps {
  user: User;
  needs: {
    drafts: Need[];
    published: Need[];
    archived: Need[];
  };
}

// 機能要件
- タブ切り替え（下書き/公開中/アーカイブ）
- 各投稿の編集・削除ボタン
- 公開/下書き切り替えトグル
- リアクション数表示
```

### 6.2 投稿一覧ページ（/needs）
```typescript
interface NeedsListPageProps {
  needs: PublicNeed[];
  userReactions?: UserReactionState;
}

// 匿名性確保
interface PublicNeed {
  id: string;
  title: string;
  body: string;
  category: string;
  author_display_name: string; // 匿名化済み
  reactions_summary: ReactionSummary;
  created_at: string;
  // email, full_name は除外
}
```

### 6.3 リアクションボタンコンポーネント
```typescript
interface ReactionButtonProps {
  needId: string;
  kind: ReactionKind;
  count: number;
  isActive: boolean;
  onToggle: (kind: ReactionKind) => Promise<void>;
}

// UI仕様
- アクティブ時: 塗りつぶし + ハイライト
- 非アクティブ時: アウトライン
- カウント数の即座反映（楽観的更新）
- ローディング状態表示
```

### 6.4 管理者画面（/admin/needs）
```typescript
interface AdminNeedsPageProps {
  needs: AdminNeed[];
  auditLogs: AuditLog[];
}

// 機能要件
- 検索・フィルタ（ステータス・カテゴリ・期間）
- 投稿凍結・解除ボタン
- 手動アーカイブボタン
- PII表示/非表示トグル
- 監査ログ表示パネル
```

## 7. E2E テスト要件

### 7.1 認証・権限テスト
```typescript
// tests/e2e-needs-crud-and-reactions.spec.ts

test('未ログインで /needs/new アクセス → ログイン強制', async ({ page }) => {
  await page.goto('/needs/new');
  await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible();
});

test('投稿CRUD権限: A作成 → A編集成功・B編集失敗', async ({ browser }) => {
  // ユーザーAで投稿作成
  // ユーザーBで同投稿編集試行 → 403エラー確認
});
```

### 7.2 リアクション機能テスト
```typescript
test('リアクショントグル: 押す→付く、再度押す→外れる', async ({ page }) => {
  await page.goto('/needs/test-need-id');
  
  // 初期状態: リアクションなし
  const reactionBtn = page.locator('[data-testid="reaction-want-to-buy"]');
  await expect(reactionBtn).toHaveAttribute('data-active', 'false');
  
  // 1回目クリック: リアクション追加
  await reactionBtn.click();
  await expect(reactionBtn).toHaveAttribute('data-active', 'true');
  
  // 2回目クリック: リアクション削除
  await reactionBtn.click();
  await expect(reactionBtn).toHaveAttribute('data-active', 'false');
});
```

### 7.3 自動アーカイブテスト
```typescript
test('60日経過シミュレーション → アーカイブ動作確認', async ({ page }) => {
  // テスト用投稿をpublished_at = 70日前で作成
  // アーカイブジョブ実行
  // 一般一覧に表示されないことを確認
  // /needs/archive に表示されることを確認
});
```

### 7.4 匿名性テスト
```typescript
test('一般一覧でPII非表示: DOM内に個人情報が存在しない', async ({ page }) => {
  await page.goto('/needs');
  
  // ページHTML内にメールアドレス・実名が含まれていないことを確認
  const pageContent = await page.content();
  expect(pageContent).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  expect(pageContent).not.toContain('test@example.com');
});
```

## 8. セキュリティ・非機能要件

### 8.1 PII保護
- **API応答**: 個人情報フィールドをサーバーサイドで除外
- **フロントエンド**: PII平文をJavaScriptコード・HTML・localStorageに保存しない
- **ログ**: 個人情報をアプリケーションログに出力しない

### 8.2 監査ログの網羅性
```typescript
// 記録対象操作
const auditActions = [
  'CREATE_NEED', 'UPDATE_NEED', 'DELETE_NEED',
  'FREEZE_NEED', 'ARCHIVE_NEED',
  'ADD_REACTION', 'REMOVE_REACTION',
  'VIEW_PII', 'ADMIN_LOGIN',
  'BULK_OPERATION'
] as const;

// 記録内容
interface AuditLogEntry {
  user_id: string;
  action: typeof auditActions[number];
  resource_type: 'needs' | 'profiles' | 'need_reactions';
  resource_id: string;
  old_values?: any;  // 変更前の値
  new_values?: any;  // 変更後の値
  metadata: {
    ip_address: string;
    user_agent: string;
    timestamp: string;
  };
}
```

### 8.3 パフォーマンス最適化
```sql
-- N+1問題回避: リアクション集計の最適化
CREATE MATERIALIZED VIEW need_reactions_summary AS
SELECT 
  need_id,
  SUM(CASE WHEN kind = 'WANT_TO_BUY' THEN 1 ELSE 0 END) as want_to_buy_count,
  SUM(CASE WHEN kind = 'INTERESTED' THEN 1 ELSE 0 END) as interested_count,
  COUNT(*) as total_reactions
FROM need_reactions
GROUP BY need_id;

-- 定期リフレッシュ
REFRESH MATERIALIZED VIEW need_reactions_summary;
```

### 8.4 レート制限
```typescript
// API呼び出し制限
const rateLimits = {
  createNeed: '5 per minute',
  toggleReaction: '30 per minute', 
  adminActions: '10 per minute'
};
```

## 9. 実装タスク分割

### Phase 1: データベース基盤
- [ ] `need_reactions`テーブル作成
- [ ] `audit_logs`テーブル作成・拡張
- [ ] RLS ポリシー実装・テスト
- [ ] マテリアライズドビュー作成

### Phase 2: API実装
- [ ] Needs CRUD API実装
- [ ] Reactions トグルAPI実装
- [ ] Admin管理API実装
- [ ] 監査ログ記録機能

### Phase 3: フロントエンド
- [ ] 投稿管理ページ（/me/needs）
- [ ] リアクションボタンコンポーネント
- [ ] 管理者画面（/admin/needs）
- [ ] 匿名性UI実装

### Phase 4: バックグラウンド・CI
- [ ] 60日アーカイブジョブ
- [ ] GitHub Actions CRON設定
- [ ] RLS Guard CI拡張
- [ ] E2Eテスト実装

### Phase 5: 本番リリース
- [ ] ステージング環境検証
- [ ] パフォーマンステスト
- [ ] セキュリティ監査
- [ ] 本番デプロイ・監視

## 10. 受け入れ基準

### 機能面
- ✅ 投稿のCRUD操作が所有者・管理者権限で正常動作
- ✅ リアクション追加・削除が1クリックでトグル動作
- ✅ 60日経過投稿が自動アーカイブされる
- ✅ 一般ユーザー間で個人情報が非表示
- ✅ 管理者による投稿凍結・アーカイブが可能

### セキュリティ面  
- ✅ RLS ポリシーで不正アクセスを防止
- ✅ API応答にPII平文が含まれない
- ✅ 全ての重要操作が監査ログに記録
- ✅ フロントエンドに機密情報が露出しない

### パフォーマンス面
- ✅ N+1問題が発生しない
- ✅ 一覧ページが2秒以内で表示
- ✅ リアクション操作が500ms以内で反映
- ✅ 集計クエリが最適化されている

### 運用面
- ✅ CI/CDでRLS設定ドリフトを検出
- ✅ 自動アーカイブジョブが安定動作
- ✅ 監査ログで運用状況を把握可能
- ✅ ロールバック手順が文書化済み