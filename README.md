# NeedPort Platform

## デプロイルール

### プレビューモード禁止
- **本番反映のみ**: プレビュー環境は使用禁止
- **デプロイコマンド**: `vercel --prod --confirm` のみ使用
- **Vercel設定**: Project Settings → Deployments → Preview Deployment Protection: Required

### 運用ルール
1. 変更は必ず本番環境に直接反映
2. vercel.app のリンクはPRレビュー専用、デザイン確認には使用しない
3. 共有リンクは `https://needport.jp/` のみ使用

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

```bash
npx vercel --prod --confirm
```
