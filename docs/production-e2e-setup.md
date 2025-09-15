# Production E2E Testing Setup

## Overview

本番環境での「ログイン済みユーザーの最小投稿フロー」を自動検証し、失敗時は即修正PRまで作成するシステムです。

## Required Environment Variables

### Test Credentials
実際のテストアカウントの認証情報を環境変数に設定してください：

```bash
export CLERK_TEST_EMAIL="test@example.com"
export CLERK_TEST_PASSWORD="TestPassword123!"
```

**重要:** テスト用の専用アカウントを使用してください。本番ユーザーの認証情報は使用しないでください。

### GitHub Secrets (CI/CD用)
GitHub Actionsで使用するため、以下のSecretsを設定してください：

- `CLERK_TEST_EMAIL`: テストアカウントのメール
- `CLERK_TEST_PASSWORD`: テストアカウントのパスワード
- `SLACK_WEBHOOK_URL`: Slack通知用（任意）
- `NOTIFICATION_EMAIL`: メール通知用（任意）

## Usage

### ローカル実行

```bash
# 1. 環境変数を設定
export CLERK_TEST_EMAIL="your-test@email.com"
export CLERK_TEST_PASSWORD="YourTestPassword"

# 2. E2Eテストのみ実行
npm run test:prod:e2e

# 3. 監視システム（自動修正付き）実行
npm run monitor:prod:e2e

# 4. 包括的監視（ヘルスチェック + E2E）
npm run monitor:prod:full
```

### CI/CD実行

GitHub Actionsワークフロー `.github/workflows/prod-smoke.yml` により：

- **夜間実行**: 毎晩3:00 AM JST（18:00 UTC）に自動実行
- **手動実行**: GitHub Actionsページから手動トリガー可能
- **失敗時通知**: SlackやEmail通知設定可能

## Test Flow

### 検証されるフロー
1. `/needs/new` アクセス → 未ログインで `/sign-in` にリダイレクト
2. テスト認証情報でログイン
3. 自動復帰で `/needs/new` に戻る
4. タイトル・本文を入力し送信
5. POST `/api/needs` が 201 を返すことを検証
6. `/me` に遷移し、下書き一覧に表示されることを検証
7. データベース状態確認（status='draft', published=false, owner_id設定）

### 失敗時の分類
- **A_AUTH**: 認証・認可統合問題
- **B_RLS**: RLS ポリシー・権限問題
- **C_SCHEMA**: データベーススキーマ制約問題
- **D_NETWORK**: ネットワーク・タイムアウト問題
- **ENV_CONFIG**: 環境設定問題

## Auto-Fix System

失敗検出時、自動的に以下を実行：

1. **原因分類**: エラーメッセージパターンによる自動分類
2. **修正コード生成**: 分類に応じた修正コードの自動生成
3. **ブランチ作成**: `fix/prod-e2e-needs-post-YYYY-MM-DD` ブランチ
4. **修正適用**: ファイル変更・SQLスクリプト実行
5. **PR作成**: 修正内容とログを含む詳細PRの自動作成

### 生成される修正例

**A_AUTH (認証問題):**
```typescript
// Enhanced auth error handling
const { userId } = await auth();
if (!userId) {
  console.error('[AUTH] No userId from auth() in production');
  return NextResponse.json({ 
    error: 'UNAUTHORIZED',
    detail: 'ログインが必要です',
    debug: process.env.NODE_ENV === 'development' ? 'No Clerk userId' : undefined
  }, { status: 401 });
}
```

**B_RLS (RLS問題):**
```sql
-- Enhanced RLS policies
CREATE POLICY "needs_insert_draft" ON needs
  FOR INSERT TO authenticated
  WITH CHECK (status = 'draft' AND published = false AND owner_id IS NOT NULL);
```

## Monitoring Dashboard

### GitHub Actions Results
- **成功**: ✅ 全テスト通過
- **失敗**: ❌ 自動修正PR作成
- **結果保存**: test-results-prod/ に詳細ログ保存

### Local Results
```bash
# ローカル実行後
ls test-results-prod/
# → スクリーンショット、ビデオ、トレースファイル

cat PROD_E2E_FIX_*.md
# → 修正ドキュメント（失敗時のみ）
```

## Troubleshooting

### 環境変数エラー
```
❌ Missing required environment variables for production E2E tests:
   - CLERK_TEST_EMAIL
   - CLERK_TEST_PASSWORD
```

**対応**: 環境変数を正しく設定してください。

### 認証エラー
```
❌ Authentication failed during E2E test
```

**対応**: 
1. Clerk Dashboard でテストアカウントが有効か確認
2. パスワードが正しいか確認
3. アカウントがロックされていないか確認

### タイムアウトエラー
```
❌ Test execution timeout
```

**対応**:
1. ネットワーク接続を確認
2. 本番サイトのステータスを確認
3. Playwright設定のタイムアウト値を調整

## Security Notes

- **テスト専用アカウント**: 本番データに影響しない専用アカウントを使用
- **認証情報保護**: GitHub Secretsやローカルのenvファイルで適切に管理
- **読み取り専用確認**: データベース操作は読み取り専用クエリのみ
- **テストデータ**: 投稿されるテストデータは明確に識別可能な内容

## Implementation Files

- `tests/prod/e2e-needs-post.spec.ts`: メインE2Eテスト
- `scripts/prod-e2e-monitor.js`: 監視・自動修正システム
- `.github/workflows/prod-smoke.yml`: CI/CDワークフロー
- `playwright.prod.config.ts`: プロダクション用Playwright設定
- `tests/prod/global-setup.ts`: E2Eテスト事前セットアップ

## Next Steps

1. テスト用Clerkアカウントの作成
2. 環境変数の設定
3. 初回手動実行での動作確認
4. GitHub Secrets設定
5. CI/CD有効化