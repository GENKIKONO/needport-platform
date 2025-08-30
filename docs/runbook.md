# NeedPort Runbook (Level-2)
## ENV 確認
- デプロイ直後に /api/ready の "ok": true を確認
## 課金フロー
- 業者: Needs詳細の「閲覧解放」→ Stripe → Webhook → vendor_accesses 付与
- ユーザー: /me の「電話サポ購読」→ Stripe → Webhook → user_phone_supports.active=true
- 解約/カード更新: /api/billing/portal → Stripe Billing Portal
## 監査・障害
- Sentry: エラー/トレースを確認（releaseタグでデプロイ紐付け）
- DB: webhook_eventsで重複イベント確認
## Cloudflare
- Bot Fight: High
- WAF: /api/webhook/stripe は誤検知を除外
## ヘルス
- /api/health, /api/ready を監視に組み込み
