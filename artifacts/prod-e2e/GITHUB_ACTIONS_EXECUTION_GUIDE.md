# GitHub Actions Production E2E Execution Guide

## 🚀 1) 本番E2E投稿フローの再実行

### GitHub Actions 手動実行手順
1. **Repository → Actions → "🔎 Production Smoke Tests"**
2. **"Run workflow" ボタンをクリック**
3. **Optional inputs**:
   - `test_email`: 空白（GitHub Secretsを使用）
   - `create_pr_on_failure`: `true` (default)
4. **"Run workflow" で実行開始**

### 期待される Artifacts
```
prod-smoke-test-results-{run_number}/
├── 📸 signin_check.png          # サインイン画面スクリーンショット
├── 📸 needs_post_e2e.png        # 投稿完了スクリーンショット (成功時)
├── 📄 response.json             # 201 API レスポンス (成功時)
├── 📊 db_check.txt              # DB確認結果
├── 🚨 error_screenshot.png      # エラースクリーンショット (失敗時)
├── 🌐 network.har               # ネットワークトラフィック (失敗時)
└── 🔧 PROD_E2E_FIX_*.md         # 自動修正提案 (失敗時)
```

### Artifacts ダウンロード
- **URL**: `https://github.com/OWNER/REPO/actions/runs/{run_id}/artifacts`
- **保持期間**: 7日間
- **サイズ**: ~500KB-2MB (スクリーンショット含む)

---

## ✅ 2) 成功条件の確認

### 201 レスポンス JSON 期待値
```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "title": "[E2E] Need Posting Smoke - 1726364710491",
  "created_at": "2025-09-15T02:05:10.491Z"
}
```

### DB確認結果 (db_check.txt) 期待内容
```sql
-- Query: SELECT status, published, owner_id FROM needs WHERE title LIKE '[E2E]%' ORDER BY created_at DESC LIMIT 1;

status: 'draft'
published: false
owner_id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' (masked)

✅ Verification Points:
- status = 'draft' (not published)
- published = false (not public)
- owner_id != null (properly assigned)
```

### /me ページ表示確認
- **場所**: My Page → 投稿したニーズ セクション
- **表示内容**: `[E2E] Need Posting Smoke - timestamp`
- **ステータス**: 下書き
- **Screenshot**: `needs_post_e2e.png`

---

## 🚨 3) 失敗時の扱い

### 自動分類システム
| 分類 | 説明 | 一般的原因 |
|------|------|------------|
| **A_AUTH** | 認証・認可問題 | Clerk設定、JWT検証 |
| **B_RLS** | RLS policy問題 | Supabase権限設定 |
| **C_SCHEMA** | DB制約問題 | テーブル構造、NOT NULL制約 |
| **D_NETWORK** | ネットワーク問題 | タイムアウト、接続エラー |
| **ENV_CONFIG** | 環境設定問題 | 環境変数未設定 |

### 失敗時の自動生成 Artifacts
```
🚨 error_screenshot.png    # 失敗箇所のスクリーンショット
🌐 network.har            # ネットワークリクエスト詳細
🔧 PROD_E2E_FIX_*.md       # 分類別自動修正提案
```

### 自動Fix提案の例
```diff
# A_AUTH の場合
+ Enhanced error logging in /api/needs
+ Clerk JWT validation improvements

# B_RLS の場合  
+ RLS policy updates for needs table
+ Profile-to-Clerk ID mapping fixes

# C_SCHEMA の場合
+ Database constraint adjustments
+ Default value settings
```

---

## ⚠️ 4) 実運用での注意点

### セキュリティ設定の確認
```
✅ Bot Protection: Low/Moderate (E2E テスト用)
✅ Rate Limiting: Moderate (過度でない設定)
✅ Sign-up Restrictions: Enabled for general users
⚠️ Test Account: 専用アカウント使用、本番ユーザーと分離
```

### テスト後の推奨アクション
1. **reCAPTCHA**: 特に変更不要（E2Eテストに影響しない設定）
2. **サインアップ制限**: 現状維持（テスト用アカウントは別途作成済み）
3. **Bot Protection**: 現状の "Low/Moderate" 設定を維持
4. **テストデータ**: 30日後に自動削除（`[E2E]` プレフィックス）

### 継続的監視
- **夜間自動実行**: 毎日3:00 AM JST
- **失敗通知**: Slack/Email (設定済み)
- **自動復旧**: 一時的障害の自動検出・回復
- **手動確認**: 重要な変更後の手動実行推奨

---

## 🎯 実行チェックリスト

### GitHub Actions 実行前
- [ ] GitHub Secrets設定確認 (CLERK_TEST_EMAIL/CLERK_TEST_PASSWORD)
- [ ] Clerk Dashboard設定確認 (Email/Password有効)
- [ ] 本番サイト基本動作確認 (https://needport.jp/sign-in)

### 実行後の確認
- [ ] Artifacts ダウンロード完了
- [ ] signin_check.png: Email/Passwordフィールド確認
- [ ] 成功時: needs_post_e2e.png, response.json, db_check.txt
- [ ] 失敗時: error_screenshot.png, network.har, 修正提案

### フォローアップ
- [ ] テストデータの自動削除設定確認 (30日後)
- [ ] 監視システムの継続動作確認
- [ ] 次回メンテナンス時の手動実行スケジュール

---

**作成日**: 2025-09-15T01:18:00Z  
**対象**: Production E2E Needs Posting Flow  
**実行環境**: GitHub Actions + https://needport.jp