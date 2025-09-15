## Summary
- pngjsでアイコンを再生成（コード生成、画像 read なし）
- manifest.ts に icons とカラー設定を補強
- /manifest.webmanifest と 2 アイコンのヘルスチェックを自動化
- /sign-in の Clerk UI 描画の最小確認テストを追加
- 影響範囲は PWA/Sign-in 周りのみ（機能追加なし、安定化のみ）

## Changes
- `scripts/tools/gen-pwa-icons.ts`: PNG生成スクリプト (#111827背景色、ブルーアクセント)
- `public/icon-192.png`, `public/icon-512.png`: 新生成アイコン
- `src/app/manifest.ts`: アイコン参照修正、ブランドカラー統一
- `scripts/prod/check-manifest-icons.ts`: manifest/アイコンURLヘルスチェック
- `tests/signin-ui.spec.ts`: /sign-in の Clerk UI 描画テスト
- `package.json`: 新スクリプト追加 (gen:icons, check:manifest, test:signin-ui)

## Test plan
- [x] PWA アイコン生成スクリプト実行: `npm run gen:icons`
- [x] manifest.ts の修正確認
- [x] ヘルスチェックスクリプト作成: `npm run check:manifest`
- [x] Playwright テストの作成: `npm run test:signin-ui`
- [x] ローカル実行チェック完了

## Expected Results
- /sign-in でのPWA manifest iconエラー解消
- 192x192、512x512のPNGアイコンが正常配信
- Clerk UIの描画健全性確認自動化

🤖 Generated with [Claude Code](https://claude.ai/code)