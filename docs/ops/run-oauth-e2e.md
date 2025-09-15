# Google OAuth E2E 実行手順

## 概要
本番環境での Google OAuth 手動検証を半自動化するスクリプトの実行手順。

## 前提条件
- 本番環境（needport.jp）が稼働中
- Clerk Live 環境で Google OAuth が設定済み
- ローカル環境にPlaywright、tsx がインストール済み
- Supabase接続設定が完了済み

## 実行手順

### 1. 環境変数設定
```bash
# 本番環境URL（デフォルト: https://needport.jp）
export PROD_BASE_URL="https://needport.jp"

# Supabase設定（DB検証用）
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### 2. OAuth E2E テスト実行
```bash
# スクリプト実行（ブラウザが自動起動）
npx tsx scripts/prod/run-oauth-e2e.ts
```

### 3. 手動操作
スクリプトが Google 認証画面で一時停止します：

1. **ブラウザに Google 認証画面が表示される**
2. **テスト用アカウントでログイン**
   - メールアドレス入力
   - パスワード入力  
   - 権限同意（初回のみ）
3. **needport.jp へのリダイレクト完了を確認**
4. **ターミナルで Enter キーを押して続行**

### 4. 自動検証継続
手動認証完了後、スクリプトが以下を自動実行：

- ✅ 認証状態確認
- ✅ `/needs/new` への移動
- ✅ テストニーズの入力・投稿
- ✅ API レスポンス確認（201）
- ✅ `/me` での下書き表示確認

### 5. DB検証実行
```bash
# Supabase DB の検証
npx tsx scripts/prod/verify-draft-in-db.ts
```

## 成果物

### スクリーンショット
- `artifacts/prod/step_*.png` - 各ステップのスクリーンショット
- `artifacts/prod/needs_post_e2e.png` - 最終成功画面

### 結果ファイル
- `artifacts/e2e/response.json` - E2E実行結果
- `artifacts/e2e/db_check.txt` - DB検証レポート（テキスト）
- `artifacts/e2e/db_results.json` - DB検証結果（JSON）

### ビデオ録画
- `artifacts/prod/video/` - ブラウザ操作の録画

## トラブルシューティング

### よくある問題

#### 1. Google認証がタイムアウト
```bash
Error: Timeout waiting for Google redirect
```
**対処**: 
- Google アカウントの2FA設定確認
- ブラウザのクッキー・キャッシュクリア
- 別のブラウザで試行

#### 2. Clerk UI が見つからない
```bash
Error: Clerk UI not found
```
**対処**:
- Clerk Live環境の設定確認
- needport.jp の稼働状況確認
- ネットワーク接続確認

#### 3. API 投稿が失敗
```bash
Error: API returned 403
```
**対処**:
- 認証状態の再確認
- プロフィール自動生成の確認
- RLS ポリシーの確認

#### 4. DB接続エラー
```bash
Error: Missing Supabase configuration
```
**対処**:
- 環境変数 `NEXT_PUBLIC_SUPABASE_URL` 設定
- 環境変数 `SUPABASE_SERVICE_ROLE_KEY` 設定
- Supabase プロジェクト設定確認

## 手動フォールバック

自動スクリプトが失敗した場合の手動検証手順：

### 1. ブラウザで手動検証
1. https://needport.jp/sign-in にアクセス
2. "Continue with Google" をクリック
3. Google認証完了
4. `/needs/new` に移動
5. テストニーズを入力・投稿
6. `/me` で下書き確認

### 2. DB を手動確認
```sql
-- Supabase SQL Editor で実行
SELECT 
  id, title, status, published, owner_id, created_at
FROM needs 
WHERE 
  title LIKE '[E2E]%' 
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## 定期実行

### 週次検証（推奨）
```bash
# crontab 設定例（毎週月曜 9:00）
0 9 * * 1 /path/to/run-oauth-e2e.sh
```

### CI/CD 組み込み
```yaml
# GitHub Actions 例
- name: OAuth E2E Validation
  run: |
    export PROD_BASE_URL="https://needport.jp"
    npx tsx scripts/prod/run-oauth-e2e.ts
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## セキュリティ注意事項

- ⚠️ **本スクリプトは本番環境に実データを作成します**
- ⚠️ **テスト用アカウントのみ使用してください**
- ⚠️ **service role key は安全に管理してください**
- ⚠️ **実行後は作成されたテストデータの削除を検討してください**

## 成功基準

以下がすべて満たされれば成功：

✅ Google OAuth認証が完了  
✅ needport.jp へのリダイレクト成功  
✅ 認証状態の確認完了  
✅ ニーズ投稿API（201レスポンス）成功  
✅ `/me` ページで下書き表示確認  
✅ DB で `status='draft'`, `published=false`, `owner_id` NOT NULL 確認  

---

**最終更新**: 2025-09-15  
**担当者**: 運営チーム