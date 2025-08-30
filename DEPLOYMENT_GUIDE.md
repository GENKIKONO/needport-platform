# 🚀 NeedPort Platform - External Preview Deployment Guide

## 📋 前提条件

✅ **完了済み項目:**
- 簡易セッション認証の実装
- 主要ページの200安定化
- 相対パス化
- CSP設定（プレビュー用緩和）
- 健康チェックAPI追加
- アイコンファイル配置

## 🔧 Vercel 環境変数設定

### 必須環境変数
```bash
# 認証モード（重要！）
AUTH_MODE=simple

# サイトURL
NEXT_PUBLIC_SITE_URL=https://<your-preview>.vercel.app

# 環境
NODE_ENV=production
```

### 注意事項
- **Clerkキーは設定しない**（`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`）
- 認証は簡易セッション（モック）のまま
- 見えることを最優先

## 🚀 デプロイ手順

### 方法1: スクリプト使用
```bash
# Vercel Token設定
export VERCEL_TOKEN="your_vercel_token_here"

# プレビューデプロイ実行
./scripts/preview.sh
```

### 方法2: GitHub連携
```bash
# コミット・プッシュ
git add -A
git commit -m "feat: external preview ready"
git push origin main

# Vercelが自動でPreview URLを発行
```

## ✅ 動作確認

### 外部URLでのスモークテスト
```bash
# プレビューURLを設定
BASE_URL="https://<your-preview>.vercel.app"

# 主要ページ確認
for p in / /needs /needs/demo-active-1 /service-overview /auth/register /auth/login /me; do
  curl -s -o /dev/null -w "$p:%{http_code}\n" "$BASE_URL$p"
done

# 旧URLリダイレクト確認
for p in /how-it-works /guide; do
  curl -s -o /dev/null -w "$p:%{http_code}\n" "$BASE_URL$p"
done

# アイコン確認
for p in /icons/icon-192.png /icons/icon-512.png /apple-touch-icon.png /favicon.ico; do
  curl -s -o /dev/null -w "$p:%{http_code}\n" "$BASE_URL$p"
done

# 健康チェック
curl -s "$BASE_URL/api/health"
```

### 期待結果
```
主要ページ: 全部 200
旧URL: 307 → /service-overview#..
アイコン: 全部 200
健康チェック: {"ok":true, ...}
```

## 🎯 完成度

### 閲覧フロー: 95-98%
- ✅ TOPページ
- ✅ ニーズ一覧・検索
- ✅ サービス概要
- ✅ 旧URLリダイレクト

### 認証フロー: 95%
- ✅ 簡易セッション登録
- ✅ ログイン・ログアウト
- ✅ マイページ（未ログイン時CTA表示）

### 外部プレビュー安定性: 95%
- ✅ CSP設定
- ✅ アイコンファイル
- ✅ 相対パス化
- ✅ 健康チェック

## 🔄 次のステップ

### 実サービス化（後で実装）
1. **Clerk認証導入**
   - `AUTH_MODE=clerk` に切り替え
   - 環境変数設定
   - 認証フロー確認

2. **Stripe決済導入**
   - 決済フロー実装
   - テスト環境設定

3. **データベース接続**
   - Supabase本番接続
   - データ永続化

## 🆘 トラブルシューティング

### よくある問題
1. **404エラー**
   - 環境変数 `NEXT_PUBLIC_SITE_URL` 確認
   - 相対パス使用確認

2. **CSPエラー**
   - プレビュー環境のCSP緩和確認
   - `vercel.live` 許可確認

3. **認証エラー**
   - `AUTH_MODE=simple` 確認
   - Clerkキー未設定確認

### ログ確認
```bash
# Vercel Functions ログ
vercel logs <deployment-url>

# ローカル確認
npm run dev
curl http://localhost:3000/api/health
```

---

**🎉 Ready for External Preview!**

外部URLから誰でも閲覧可能な状態です。
認証は簡易セッションのまま、見えることを最優先に実装完了。
