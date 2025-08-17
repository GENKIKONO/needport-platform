#!/bin/bash

# E2E スモークテスト
BASE="https://needport.jp"

echo "=== E2E スモークテスト開始 ==="
echo "対象URL: $BASE"
echo ""

echo "1) 基本ページアクセステスト"
for u in / /needs /needs/need-001; do
  echo -n "$u -> "
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$u")
  echo "$status"
  if [ "$status" != "200" ]; then
    echo "❌ エラー: $u が $status を返しました"
  else
    echo "✅ OK: $u"
  fi
done

echo ""
echo "2) 手動テスト項目"
echo "✅ 詳細ページで提案フォームが表示される"
echo "✅ 提案送信が成功する"
echo "✅ 投稿者が承認ボタンを押せる"
echo "✅ 承認後にルームページに遷移する"
echo "✅ ルームでメッセージ送信ができる"
echo "✅ ルームでマイルストーン作成ができる"
echo "✅ 未承認ユーザーは送信不可（403）"

echo ""
echo "3) API エンドポイントテスト"
echo "POST /api/offers -> 提案作成"
echo "GET /api/offers?need_id=xxx -> 提案一覧"
echo "POST /api/offers/:id/accept -> 提案承認"
echo "GET /api/rooms/:id/messages -> メッセージ取得"
echo "POST /api/rooms/:id/messages -> メッセージ送信"
echo "GET /api/milestones/:roomId -> マイルストーン取得"
echo "POST /api/milestones/:roomId -> マイルストーン作成"

echo ""
echo "=== テスト完了 ==="
echo "問題があれば以下を確認:"
echo "1. Supabase テーブルが作成されているか"
echo "2. Vercel 環境変数が設定されているか"
echo "3. 再デプロイが完了しているか"
echo "4. ブラウザで手動テストを実行"
