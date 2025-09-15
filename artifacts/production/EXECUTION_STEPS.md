# 🚀 本番プロビジョニング実行手順

## 手順:

### 1) Supabase SQL Editor に enable-auto-provisioning.LIVE.sql を丸ごと貼り付けて実行

**操作:**
1. **Supabase Dashboard** にアクセス: https://supabase.com/dashboard/projects
2. **本番プロジェクト** を選択
3. **SQL Editor** タブを開く
4. **New query** をクリック
5. `artifacts/production/enable-auto-provisioning.LIVE.sql` の内容を **全てコピー&ペースト**
6. **Run** ボタンをクリックして実行

**期待される出力:**
```
Migration verification: ✅ profiles.email column exists, ✅ needs.owner_id column exists
Profiles verification: total_profiles=3, genkikono_profiles=2, test_profiles=1
RLS policies verification: 4つのポリシーが正常作成
🎉 Auto-provisioning enablement completed successfully!
```

### 2) npx vercel --prod --confirm で本番再デプロイ

**コマンド:**
```bash
npx vercel --prod --confirm
```

**期待される結果:**
- ✅ Build成功
- ✅ Live Clerkキーでデプロイ完了
- ✅ https://needport.jp への反映

### 3) ブラウザで https://needport.jp/needs/new にログイン後アクセス → タイトル/本文で投稿

**手順:**
1. ブラウザで **https://needport.jp** を開く
2. **ログイン** をクリック（Liveキー使用）
3. **https://needport.jp/needs/new** にアクセス
4. **テスト投稿を作成:**
   - **タイトル:** `[E2E] Live Auto-provisioning Test - $(date)`
   - **本文:** `Testing live environment auto-provisioning functionality`
   - **カテゴリ:** 任意選択
   - **地域:** 任意選択
5. **投稿** ボタンをクリック

### 4) 成功期待値:

**API レスポンス:**
- **Status:** `201 Created`
- **Response body:**
  ```json
  {
    "id": "uuid-here",
    "title": "[E2E] Live Auto-provisioning Test - ...",
    "status": "draft",
    "owner_id": "user-profile-uuid",
    "created_at": "2025-09-15T...",
    "published": false
  }
  ```

**データベース確認:**
- **needs.owner_id** が自分のプロフィールUUID
- **status='draft'**
- **published=false**

**UI確認:**
- **/me** にアクセス
- **下書き一覧** に今の投稿が表示される
- **航海中の取引** カウントが増加

---

## 🔍 トラブルシューティング

### エラー別対応方法:

**A_AUTH (401 Unauthorized):**
- Live Clerkキー/ドメイン不一致
- → Vercel環境変数の再確認

**B_PROFILE (USER_NOT_FOUND/PROFILE_CREATE_ERROR):**
- profiles列/ユニーク制約/トリガ設定不整合
- → SQLマイグレーション再実行

**C_RLS (権限エラー):**
- needsのRLS/ポリシーが原因
- → RLSポリシー再作成

**D_API (500 Internal Server Error):**
- app/api/needs/route.ts の ensureProfile() や owner_id 設定
- → Vercel Function ログ確認

---

## ✅ 検証完了チェックリスト

- [ ] Supabase SQL実行完了
- [ ] Vercel本番デプロイ完了  
- [ ] ログイン成功（Live Clerk）
- [ ] /needs/new アクセス成功
- [ ] 投稿API 201 Created
- [ ] DB確認: owner_id設定済み
- [ ] /me 画面: 下書き表示確認

**最終目標:** 
新規ユーザーでもGoogleログイン直後から投稿可能（手動プロフィール作成は不要）