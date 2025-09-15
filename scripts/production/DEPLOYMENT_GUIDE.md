# 本番環境プロフィール自動プロビジョニング有効化ガイド

## 🎯 概要
本番環境でプロフィール自動プロビジョニング機能を有効化するための手順書です。

## 📋 前提条件
- Supabase 本番環境へのアクセス権限
- Clerk 本番環境の Secret Key
- Vercel デプロイ権限

## 🚀 実行手順

### Step 1: Clerk ユーザーID取得

```bash
# Clerk Secret Keyを設定して実行
CLERK_SECRET_KEY=sk_live_xxx node scripts/production/get-clerk-user-ids.js
```

**出力例:**
```
🔍 Fetching Clerk user IDs for production...

Searching for: genkikono.2615@gmail.com
  ✅ Found: user_2mBxYzQzBvNpZXW4mVnCk3tL9fR
      Name: 元気 河野
      Created: 2025-09-10T10:30:00.000Z

📝 Generated SQL with actual Clerk user IDs:
-- For genkikono.2615@gmail.com:
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_2mBxYzQzBvNpZXW4mVnCk3tL9fR',
  'genkikono.2615@gmail.com', 
  '元気 河野',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET...
```

### Step 2: Supabase Migration実行

1. **Supabase Dashboard** → **SQL Editor** を開く
2. `scripts/production/enable-auto-provisioning.sql` の内容をコピー
3. **Step 1で取得した実際のClerk User IDに置き換え**:
   ```sql
   -- 🔄 この部分を置き換え
   VALUES (
     'user_2mBxYzQzBvNpZXW4mVnCk3tL9fR', -- ← 実際のClerk User IDに置き換え
     'genkikono.2615@gmail.com',
     '元気 河野',
     'admin',
     NOW(),
     NOW()
   )
   ```
4. **実行** ボタンをクリック

**期待される出力:**
```
Migration verification: ✅ profiles.email column exists, ✅ needs.owner_id column exists
Profiles verification: total_profiles=3, genkikono_profiles=2, test_profiles=1
🎉 Auto-provisioning enablement completed successfully!
```

### Step 3: Vercel デプロイ

```bash
# 本番環境にデプロイ
npx vercel --prod --confirm
```

**確認URL:** https://needport.jp

### Step 4: 動作確認テスト

#### 4.1 手動テスト
1. https://needport.jp/sign-in でログイン
2. https://needport.jp/needs/new で新規投稿
3. タイトル: `[TEST] Auto-provisioning test`
4. 本文: `Testing profile auto-provisioning feature`
5. **投稿** ボタンクリック

#### 4.2 SQL確認
Supabase SQL Editorで `scripts/production/post-deployment-test.sql` を実行:

```sql
-- 最新の投稿確認
SELECT 
  '🎯 Latest Need Verification' as check_section,
  n.id,
  n.title,
  n.owner_id,
  n.status,
  p.email as owner_email,
  CASE 
    WHEN n.owner_id IS NOT NULL THEN '✅ owner_id is set'
    ELSE '❌ owner_id is NULL'
  END as owner_id_status
FROM needs n
LEFT JOIN profiles p ON p.id = n.owner_id
WHERE n.created_at > NOW() - INTERVAL '10 minutes'
ORDER BY n.created_at DESC
LIMIT 5;
```

**期待される結果:**
```
✅ owner_id is set
✅ status is draft  
✅ published is false
✅ owner_email matches logged-in user
```

## 🔍 トラブルシューティング

### 問題 1: プロフィールが作成されない
**症状:** 投稿時に `USER_NOT_FOUND` エラー

**解決策:**
```bash
# Clerk User IDが正しいか確認
node scripts/production/get-clerk-user-ids.js

# 手動でプロフィール作成
INSERT INTO profiles (clerk_user_id, email, full_name, role)
VALUES ('正しいClerkUserID', 'email@example.com', 'Name', 'user');
```

### 問題 2: owner_id が NULL
**症状:** 投稿は成功するが owner_id が設定されない

**解決策:**
```sql
-- ensureProfile関数の動作確認
SELECT * FROM profiles WHERE clerk_user_id = '実際のClerkUserID';

-- RLS ポリシー確認
SELECT * FROM pg_policies WHERE tablename = 'needs';
```

### 問題 3: RLS ポリシーエラー
**症状:** 投稿時に権限エラー

**解決策:**
```sql
-- RLS ポリシーを再作成
DROP POLICY IF EXISTS "authenticated_insert_needs" ON needs;
CREATE POLICY "authenticated_insert_needs" ON needs
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    owner_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text
    )
  );
```

## ✅ 成功の確認項目

- [ ] Migration 適用完了（スキーマ変更）
- [ ] プロフィール作成完了（指定ユーザー分）
- [ ] RLS ポリシー更新完了（4つのポリシー）
- [ ] Vercel デプロイ完了
- [ ] 手動投稿テスト成功
- [ ] owner_id 正常設定確認
- [ ] プロフィール自動作成確認

## 📞 サポート

問題が発生した場合：
1. **ログ確認**: Vercel Functions ログを確認
2. **データベース確認**: 上記SQLクエリで状態確認
3. **ロールバック**: 必要に応じて migration を戻す

---

**作成日:** 2025-09-15  
**対象環境:** Production (https://needport.jp)  
**関連PR:** fix/auth-auto-provision-profiles