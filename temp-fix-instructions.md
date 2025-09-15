# 緊急修正手順

## 問題
`clerk.needport.jp` の DNS 解決失敗により Google OAuth が表示されない

## 手動操作（1-2分で完了）

### Vercel 設定修正
1. https://vercel.com/genkis-projects-03a72983/needport-platform に移動
2. Settings → Environment Variables
3. `NEXT_PUBLIC_CLERK_FRONTEND_API` を探す
4. 値を `allowing-gnat-26.clerk.accounts.dev` に変更
5. Save → Redeploy

### 確認コマンド
修正後、以下を実行してOK確認:
```bash
npm run diag:clerk-front
npm run check:google
```

## 期待される結果
- Console Error: なし
- Clerk Loaded: true  
- Google button: FOUND