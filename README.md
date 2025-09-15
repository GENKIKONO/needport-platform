# NeedPort Platform

## デプロイルール

### プロダクションオンリー運用
- **プレビュー無効**: Vercel Preview Deployments を完全無効化
- **本番反映のみ**: main ブランチへの push で自動的に本番デプロイ
- **GitHub Actions**: `.github/workflows/deploy-prod.yml` による自動デプロイ

### 運用フロー
1. **開発**: ローカルで開発・テスト実行
2. **PR作成**: feature ブランチから main への Pull Request 作成
3. **レビュー**: コードレビュー・CI チェック通過
4. **マージ**: main ブランチにマージ
5. **自動デプロイ**: GitHub Actions が本番環境に自動デプロイ
6. **確認**: `https://needport.jp/` で動作確認

### 共有リンク
- **本番URL**: `https://needport.jp/` のみ使用
- **vercel.app リンク**: 使用禁止（Preview が無効のため存在しない）

## 開発環境

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## デプロイ

### 自動デプロイ（推奨）
main ブランチにマージすると GitHub Actions が自動実行:
```bash
git push origin main  # 自動的に本番デプロイ実行
```

### 手動デプロイ（緊急時のみ）
```bash
npx vercel --prod --confirm
```

## 運用ガイド

### 🏥 ヘルスチェック・監視

#### システムヘルスの確認
```bash
# 本番環境のヘルスチェック
curl https://needport.jp/api/health

# ローカル環境のヘルスチェック
curl http://localhost:3000/api/health
```

#### 定期監視
- **自動監視**: GitHub Actions により毎日夜間（3:00 AM JST）に実行
- **監視内容**: 
  - データベース接続
  - RLS（Row Level Security）ポリシー
  - セキュリティ設定
  - 重要なユーザーフロー（ニーズ一覧→詳細→エンゲージメント）
- **通知**: Slack または GitHub Issues で異常時に自動通知

#### 手動監視テスト
```bash
# 本番環境の監視テスト実行
npm run monitor:prod

# ローカル環境の監視テスト実行
npm run monitor

# 軽量なスモークテスト
BASE="https://needport.jp" npm run smoke:ci
```

### 🚨 障害対応・復旧手順

#### 1. 初期確認
```bash
# システム全体の健全性確認
curl -s https://needport.jp/api/health | jq .

# 重要エンドポイントの確認
curl -s https://needport.jp/api/needs
curl -s https://needport.jp/api/ready
```

#### 2. 原因調査
```bash
# 詳細な診断情報取得
curl -s https://needport.jp/api/health | jq '.checks'

# データベース接続の詳細確認
curl -s https://needport.jp/api/health | jq '.checks.database'

# セキュリティ設定の確認
curl -s https://needport.jp/api/health | jq '.checks.security'
```

#### 3. 復旧手順

##### A. アプリケーションレベルの問題
```bash
# 再デプロイによる復旧
npx vercel --prod --confirm

# デプロイ状況の確認
vercel ls
```

##### B. データベース接続問題
```sql
-- Supabase SQL Editor で実行
-- RLS ポリシーの確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'needs';

-- 接続プール状況の確認
SELECT * FROM pg_stat_activity WHERE datname = current_database();
```

##### C. RLS ポリシーの再読み込み
```sql
-- Supabase SQL Editor で RLS ポリシーをリセット（緊急時のみ）
-- 注意: 本番環境では慎重に実行

-- needs テーブルの RLS を無効化（緊急措置）
ALTER TABLE needs DISABLE ROW LEVEL SECURITY;

-- RLS を再有効化（ポリシー確認後）
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;

-- ポリシーの再作成例（具体的なポリシーは環境により異なる）
-- CREATE POLICY "needs_select_policy" ON needs FOR SELECT USING (true);
```

#### 4. ロールバック手順
```bash
# 直前のデプロイメントを確認
vercel ls

# 問題のあるデプロイメントを特定後、直前の正常なコミットから再デプロイ
git log --oneline -10
git checkout <正常なコミットのSHA>
npx vercel --prod --confirm

# 修正後、mainブランチに戻る
git checkout main
```

### 📊 パフォーマンス・可用性監視

#### 重要メトリクス
- **Response Time**: API応答時間（目標: 95%ile < 2秒）
- **Database Connection**: DB接続時間（目標: < 500ms）
- **Uptime**: 稼働率（目標: 99.9%以上）
- **Error Rate**: エラー率（目標: < 1%）

#### パフォーマンス確認
```bash
# 本番環境のレスポンス時間測定
time curl -s https://needport.jp/api/health > /dev/null

# 複数回実行して平均応答時間を確認
for i in {1..5}; do time curl -s https://needport.jp/api/health > /dev/null; done
```

### 🔐 セキュリティ・設定確認

#### 環境変数の確認
```bash
# 本番環境で必要な環境変数（Vercel Dashboard で確認）
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY (admin operations用)
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY

# CI/CD で必要なシークレット (GitHub Secrets)
# - SLACK_WEBHOOK_URL (monitoring notifications)
# - NOTIFICATION_EMAIL (alert emails)
```

#### セキュリティ設定の確認
```bash
# RLS と認証の動作確認
curl -X POST https://needport.jp/api/needs \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}' 
# → 認証エラーまたは RLS エラーが期待される（正常な場合）

# 管理者機能の保護確認
curl https://needport.jp/api/admin/needs
# → 401 Unauthorized が期待される
```

### 📧 監視・通知の設定

#### Slack通知の設定
1. Slack Workspace で Incoming Webhooks を作成
2. GitHub Secrets に `SLACK_WEBHOOK_URL` を追加
3. 毎夜 3:00 AM JST に自動実行される

#### GitHub Issues 自動作成
- 障害検知時に自動でIssueを作成
- 復旧時に自動でIssueをクローズ
- 重要度に応じたラベル付け（`urgent`, `monitoring`, `alert`）

#### 手動通知テスト
```bash
# 夜間監視ワークフローを手動実行
# GitHub Actions → "🌙 Nightly Monitoring" → "Run workflow"
```

### 🛠️ 開発者向けデバッグ

#### ローカル開発での監視テスト
```bash
# ローカルサーバー起動
npm run dev

# ローカル環境でヘルスチェック
curl http://localhost:3000/api/health

# ローカル環境で監視テスト実行
npm run monitor
```

#### トラブルシューティング
```bash
# ビルドエラーの確認
npm run build 2>&1 | tee build.log

# TypeScript エラーの確認
npm run typecheck

# Lint エラーの確認
npm run lint

# テスト実行
npm test
```

### 📞 エスカレーション

#### 緊急時の連絡先
1. **Level 1**: GitHub Issues で alert ラベル付きで報告
2. **Level 2**: Slack の #alerts チャンネル（設定済みの場合）
3. **Level 3**: 直接連絡（重大な本番障害の場合）

#### ログの確認場所
- **Application Logs**: Vercel Dashboard → Functions → Logs
- **Error Tracking**: Sentry Dashboard（設定済みの場合）
- **Database Logs**: Supabase Dashboard → Logs
