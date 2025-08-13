# Need Scale 機能 - Smoke テスト手順

## 前提条件

DB 反映は Supabase か CLI のどちらか。どちらか1回やればOK

## DB マイグレーション

### 方法1: Supabase SQL Editor
1. Supabase Dashboard → SQL Editor を開く
2. `supabase/migrations/9999_need_scale_idempotent.sql` の内容を丸ごと貼り付けて実行

### 方法2: CLI（環境があれば）
```bash
npx supabase db push
```

## サーバー起動

```bash
npm run dev
```

## Smoke テスト実行

```bash
npm run smoke
```

## 期待結果

```
🧪 Smoke testing Need Scale at http://localhost:3000
1. Checking CSP header...
✅ CSP header found
2. Checking nonce attribute...
✅ nonce attribute found
3. Testing personal need creation...
✅ Personal need creation successful
4. Testing community need creation...
✅ Community need creation successful
🎉 All smoke tests passed!
```

## トラブルシューティング

- **CSP header not found**: サーバーが起動していないか、CSP 設定に問題
- **nonce attribute not found**: Edge/Node 両対応の nonce 生成に問題
- **Personal/Community creation failed**: API または DB に問題

## DB 検証

Supabase SQL Editor で `docs/db-verify.sql` を実行して以下を確認：
- RLS ポリシーが正しく設定されているか
- need_scale enum が存在するか
- idx_needs_scale インデックスが存在するか
- テストデータが正しく保存されているか
