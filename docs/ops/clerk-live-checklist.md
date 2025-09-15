# Clerk Live環境 設定チェックリスト

**目的:** Test→Live環境切り替え時のClerk設定漏れを防止  
**対象:** 本番デプロイ前の必須確認事項  
**更新日:** 2025-09-15

---

## 🚨 緊急対応手順（Googleログイン不可時）

### 即時診断コマンド
```bash
# 1. 環境変数確認
npm run clerk:verify

# 2. UI健全性確認
npm run clerk:health

# 3. 統合診断
npm run clerk:guard
```

### 応急措置（設定が不完全な場合）
1. **Clerk Dashboard** → **Live Environment** で設定完了
2. **継続監視** → CI guardsが機能していることを確認
3. **設定同期** → Test環境から設定を移行

---

## ✅ 必須設定チェックリスト

### 1. 環境変数設定
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_*` 形式
- [ ] `CLERK_SECRET_KEY` → `sk_live_*` 形式
- [ ] **Vercel環境変数** に両方設定済み
- [ ] **GitHub Secrets** に両方設定済み（CI用）

### 2. Clerk Dashboard - Live Environment
#### OAuth Applications（必須）
- [ ] **Google OAuth** 追加済み
- [ ] Client ID/Secret 設定済み
- [ ] **"Used for sign-in"** 有効化
- [ ] **Status: Enabled** 確認

#### Domains & Origins
- [ ] **Domain:** `needport.jp` 追加済み
- [ ] **Primary domain** 設定済み
- [ ] **Allowed Origins:**
  - [ ] `https://needport.jp`
  - [ ] `https://needport.jp/*`

#### Redirect URLs
- [ ] **Sign-in URL:** `/sign-in`
- [ ] **Sign-up URL:** `/sign-up`  
- [ ] **Authorized redirect URLs:**
  - [ ] `https://needport.jp/sign-in*`
  - [ ] `https://needport.jp/sign-up*`
  - [ ] `https://needport.jp/sso-callback*`

### 3. 実機検証
- [ ] https://needport.jp/sign-in でClerk UI描画
- [ ] Google ログインボタン表示・動作
- [ ] 認証後マイページアクセス可能
- [ ] 投稿機能（ニーズ作成）正常動作

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### ❌ SignIn UIが描画されない
**原因:** OAuth設定未完了  
**解決:** Clerk Dashboard → Social connections → Google追加

#### ❌ "Invalid publishable key" エラー
**原因:** Test環境キーが混在  
**解決:** Vercel環境変数をLiveキーに統一

#### ❌ "Unauthorized origin" エラー
**原因:** Allowed Origins未設定  
**解決:** `https://needport.jp` と `https://needport.jp/*` を追加

#### ❌ OAuth redirect loop
**原因:** Redirect URLs設定不備  
**解決:** 正確なパス設定（上記チェックリスト参照）

### 緊急復旧コマンド
```bash
# Test→Live設定同期（両環境のキーが必要）
CLERK_SECRET_KEY_TEST="sk_test_..." \
CLERK_SECRET_KEY="sk_live_..." \
npm run clerk:sync

# ヘッドレス診断（Playwright使用）
npm run clerk:health

# 手動設定検証
npm run clerk:verify
```

---

## 🤖 自動化ツール

### CI/CD Guards
- **.github/workflows/clerk-config-guard.yml** → デプロイ前チェック
- **npm scripts** → 手動実行コマンド群
- **診断API** → `/api/diag/clerk-status` リアルタイム確認

### 監視・通知
- **日次監視** → 3:00 AM JST 自動チェック
- **設定ドリフト検知** → 設定変更時に通知
- **失敗時自動Issue作成** → GitHub Issues自動作成

### 使用可能なスクリプト
```bash
# 設定確認
npm run clerk:verify      # Live環境設定チェック
npm run clerk:health      # UI健全性チェック  
npm run clerk:guard       # 統合チェック

# 設定同期
npm run clerk:sync        # Test→Live設定移行

# CI実行
npm run ci                # ビルド+テスト+E2E
npm run test:prod:login   # 本番ログインE2E
```

---

## 📋 デプロイ前チェック手順

### ステップ1: ローカル確認
```bash
# 1. 環境変数設定確認
echo $CLERK_SECRET_KEY | grep "sk_live_"
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | grep "pk_live_"

# 2. 設定検証実行
npm run clerk:guard

# 3. 結果が ✅ All configurations valid であることを確認
```

### ステップ2: Clerk Dashboard確認
1. [Clerk Dashboard](https://dashboard.clerk.com/) にアクセス
2. **Live environment** 選択確認
3. 上記チェックリストの全項目を確認
4. Test設定との差分確認

### ステップ3: 本番デプロイ
```bash
# Vercel本番デプロイ（プレビュー禁止）
npx vercel --prod --confirm

# デプロイ後即時確認
npm run test:prod:login
```

### ステップ4: 事後確認
- [ ] https://needport.jp/sign-in で機能確認
- [ ] Google認証→投稿フロー成功
- [ ] 監視システム正常動作確認

---

## 🔗 関連リソース

### 公式ドキュメント
- [Clerk Environments](https://clerk.com/docs/deployments/environments)
- [Google OAuth Setup](https://clerk.com/docs/authentication/social-connections/google)
- [Production Configuration](https://clerk.com/docs/deployments/production)

### NeedPort内部リソース
- `scripts/clerk/verify-live-config.ts` - 設定検証スクリプト
- `scripts/clerk/sync-from-test-to-live.ts` - 設定同期スクリプト
- `scripts/diag/print-signin-health.ts` - UI健全性診断
- `src/components/auth/AuthFallback.tsx` - ユーザー向けエラーUI

### エラー報告
- **GitHub Issues:** https://github.com/[org]/needport-platform/issues
- **運営連絡:** support@needport.jp
- **緊急連絡:** （社内連絡先）

---

## 📝 変更履歴

| 日付 | 変更内容 | 担当者 |
|------|----------|--------|
| 2025-09-15 | 初版作成（Test→Live切替対応） | Claude |

---

**⚠️ 重要: このチェックリストは本番環境への影響を防ぐため、すべての項目を必ず確認してください。**