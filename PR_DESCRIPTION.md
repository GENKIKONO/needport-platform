# PR: fix: auto-provision profiles & set owner_id

## 概要
初回ログイン時の自動プロフィール作成機能と、ニーズ投稿時の適切なowner_id設定を実装しました。

## 実装内容

### A. 初回ログイン時の自動プロビジョニング
- **lib/ensureProfile.ts**: Clerkユーザー情報からプロフィールを自動作成/確保
- **app/api/needs/route.ts**: 投稿API修正、`currentUser()` + `ensureProfile()` 使用
- 競合状態での重複作成を防止（unique constraint handling）

### B. 既存Clerkユーザーの一括同期
- **scripts/clerk/backfill-profiles.ts**: Clerk API経由での既存ユーザー同期
- ページング対応、エラーハンドリング、進捗表示
- **npm script**: `npm run clerk:backfill:profiles`

### C. ヘッダーのログアウト導線
- **components/AuthMenu.tsx**: ドロップダウンメニュー付きの認証UI
- **components/chrome/Header.tsx**: AuthMenuコンポーネント統合
- Clerk `<SignOutButton>` 使用

### D. データベース スキーマ更新
- **profiles**: `clerk_user_id` nullable, `email`, `full_name` 追加
- **needs**: `owner_id` (UUID), `status` ('draft'|'published'|'closed') 追加
- **migration**: `supabase/sql/migration_auto_provision_profiles.sql`

### E. テスト・診断ツール
- **E2E tests**: owner_id 検証ロジック追加
- **診断ツール**: `scripts/diag/print-profile.ts` でプロフィール状態確認

## 技術的詳細

### APIの変更
```typescript
// Before: プロフィール手動検索
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('clerk_id', userId);

// After: 自動プロビジョニング
const profileId = await ensureProfile({
  id: user.id,
  email: user.emailAddresses[0]?.emailAddress,
  name: `${user.firstName} ${user.lastName}`.trim()
});
```

### データベース更新
```sql
-- profiles テーブル
ALTER TABLE profiles 
  ALTER COLUMN clerk_user_id DROP NOT NULL,
  ADD COLUMN email TEXT,
  ADD COLUMN full_name TEXT;

-- needs テーブル  
ALTER TABLE needs 
  ADD COLUMN owner_id UUID REFERENCES profiles(id),
  ADD COLUMN status TEXT DEFAULT 'draft';
```

### RLS ポリシー
- `public_read_published_needs`: 公開ニーズの読み取り
- `owner_full_access_needs`: オーナーの全アクセス
- `authenticated_insert_needs`: 認証済みユーザーの投稿

## 動作確認手順

### 1. ローカル開発環境
```bash
# 1. Supabase migration 実行
psql "$DATABASE_URL" -f supabase/sql/migration_auto_provision_profiles.sql

# 2. 既存ユーザー同期（任意）
npm run clerk:backfill:profiles

# 3. 動作確認
# /needs/new でログイン → 投稿 → owner_id 設定確認
```

### 2. 本番環境
```bash
# 1. Migration実行後、初回ログインで自動プロビジョニング確認
# 2. 投稿時の owner_id 設定確認（NOT NULL制約）
```

## セキュリティ考慮事項
- プロフィール作成時の競合状態ハンドリング
- RLS ポリシーによる適切なアクセス制御
- Clerk認証必須、service-role key使用

## 成果物
- **新規ファイル**: 5個（ensureProfile, AuthMenu, backfill script等）
- **修正ファイル**: 8個（API, Header, tests, package.json等）
- **Migration**: 1個（schema更新SQL）

## GitHub PR URL
手動でPRを作成してください：
https://github.com/GENKIKONO/needport-platform/pull/new/fix/auth-auto-provision-profiles

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>