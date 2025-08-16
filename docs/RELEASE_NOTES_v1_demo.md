# Release Notes v1.0 - B2B Demo Phase-1

## 概要
B2Bプラットフォームのデモ機能を実装しました。すべての機能はUIレベルでのみ動作し、実際の決済や認証は無効化されています。

## 収録機能

### 賛同システム
- **賛同ピル**: 決定論的な賛同数表示（3-9の安定値）
- **A/Bテスト**: 賛同ピルの表示バリエーション
- **賛同オーバーライド**: Adminで手動設定可能（0-999）
- **解禁演出**: 閾値以上で「解禁」バッジ表示

### 提案比較UI
- **提案テーブル**: 価格・期間でソート可能
- **Hireモーダル**: 無効状態でマイルストーン表示
- **承認済み提案統合**: デモ提案とマージ表示

### Admin Demo Console
- **簡易ログイン**: Cookieベースの認証
- **プロジェクト管理**: 作成・承認・却下・移動・削除・コメント
- **提案管理**: 承認・却下・注目設定
- **Export/Import**: JSON形式での状態保存・復元
- **cURL生成**: 実案件作成用コマンドのコピー

### 承認制モデレーション
- **公開制御**: 未承認は非表示または「審査中」バッジ
- **カテゴリ上書き**: Admin操作でカテゴリ変更
- **コメント機能**: 管理側コメントの追加・削除

### 提案作成UI
- **構造化フォーム**: ベンダー名・価格・期間・成果物・リスク・条件
- **コンテンツLinter**: 連絡先直書き・外部リンク検出
- **バリデーション**: エラー時は保存不可、警告時は保存可能

## 既知の制約

### 技術的制約
- **すべてUI/ローカル**: データはlocalStorageにのみ保存
- **APIは501**: 新規B2B APIはすべて「not implemented」を返す
- **決済OFF**: PAYMENTS_ENABLED=0で決済機能は無効
- **認証OFF**: 実際の認証は行われない

### 運用制約
- **ステージング専用**: 本番環境での使用は推奨しない
- **検索非公開**: NEXT_PUBLIC_SITE_NOINDEX=1で検索エンジンに非公開
- **デモデータ**: すべてダミーデータ、実際の取引は発生しない

## フラグ行列

### 本番環境（推奨）
```env
EXPERIMENTAL_B2B=0
NEXT_PUBLIC_SITE_NOINDEX=0
NEXT_PUBLIC_SHOW_DEMO=0
NEXT_PUBLIC_REQUIRE_APPROVAL=0
NEXT_PUBLIC_ALLOW_DEMO_PROPOSALS=0
PAYMENTS_ENABLED=0
```

### ステージングデモ（開発・デモ用）
```env
EXPERIMENTAL_B2B=1
NEXT_PUBLIC_SITE_NOINDEX=1
NEXT_PUBLIC_SHOW_DEMO=1
NEXT_PUBLIC_REQUIRE_APPROVAL=1
NEXT_PUBLIC_ALLOW_DEMO_PROPOSALS=1
PAYMENTS_ENABLED=0
```

## スモーク手順

### 1. 環境設定
```bash
# ステージングデモ用フラグ設定
export EXPERIMENTAL_B2B=1
export NEXT_PUBLIC_SITE_NOINDEX=1
export NEXT_PUBLIC_SHOW_DEMO=1
export NEXT_PUBLIC_REQUIRE_APPROVAL=1
export NEXT_PUBLIC_ALLOW_DEMO_PROPOSALS=1
export PAYMENTS_ENABLED=0
export NEXT_PUBLIC_DEMO_UNLOCK_THRESHOLD=10
export ADMIN_UI_KEY=change-me
```

### 2. デモページ確認
```bash
# /demo ページにアクセス
curl -s http://localhost:3000/demo | grep -i "demo mode"
# 期待結果: "DEMO MODE" バナーが表示される
```

### 3. Admin Console操作
```bash
# Adminログイン
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"key":"change-me"}'

# Adminページにアクセス
# 1. Reset Demo → ローカル状態クリア
# 2. Seed Demo → 初期案件生成
# 3. 賛同数を10以上に設定
# 4. 提案作成 → 承認 → 比較表示確認
```

### 4. B2B API確認
```bash
# すべてのB2B APIが501を返すことを確認
for endpoint in \
  /api/needs/test/endorse \
  /api/needs/test/proposals \
  /api/proposals/test/hire \
  /api/contracts/test/escrow/fund \
  /api/contracts/test/reviews; do
  echo "Testing $endpoint:"
  curl -s -X POST "http://localhost:3000$endpoint" | jq -r '.todo'
done

# 期待結果: すべて "B2B Phase-1 scaffold" または類似のメッセージ
```

### 5. 機能確認チェックリスト
- [ ] /demo ページに「DEMO MODE」バナー表示
- [ ] NeedCardに賛同ピル表示（3-9の数値）
- [ ] 賛同10以上で「解禁」バッジ表示
- [ ] 「提案する」ボタンが活性化
- [ ] 提案作成フォームでLinter動作
- [ ] Adminで提案承認後、比較UIに表示
- [ ] Hireボタンで無効モーダル表示
- [ ] 決済関連UIが非表示

## 本番化への移行計画

### Phase 2（将来）
- B2B APIの実装（501 → 実際の処理）
- 決済機能の有効化
- 認証システムの統合
- データベース永続化
- 監査ログの実装

### 注意事項
- 現在のデモ機能はすべて削除予定
- 本番化時は既存のNeed投稿機能に影響なし
- 段階的な移行で安全性を確保
