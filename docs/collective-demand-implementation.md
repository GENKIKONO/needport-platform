# 集合的需要の可視化（Collective Demand Visualization）実装完了

## 概要

NeedPortの要件「1つのニーズに複数ユーザーの購入意向を集め、事業性が見えたら提案が起きる」をLv1として実装完了。

## 実装内容

### 1. データベーススキーマ拡張

**実装ファイル**: `database/migrations/002-collective-demand.sql`

- `needs`テーブルに`threshold_pledge`カラム追加（デフォルト値: 5）
- `need_engagements`テーブル作成（認証済みユーザーのリアクション）
- `need_anonymous_interest`テーブル作成（匿名ユーザーの「気になる」）
- `engagement_kind` enum作成（'interest', 'pledge'）
- Row Level Security（RLS）ポリシー設定

### 2. API実装

**エンドポイント**:
- `POST /api/needs/[id]/engagement` - エンゲージメント登録
- `DELETE /api/needs/[id]/engagement` - エンゲージメント削除（トグル）
- `GET /api/needs/[id]/engagement/summary` - エンゲージメント集計情報
- `GET /api/needs/[id]/engagement/user` - 現在のユーザーのエンゲージメント状態

**主要機能**:
- 匿名ユーザー: 「気になる」のみ可能、IP+UA+saltでハッシュ化してデイリー重複排除
- 認証済みユーザー: 「興味あり」「購入したい」の選択可能、トグル機能
- レート制限: 匿名は1分間に10回まで
- エラーハンドリングとレスポンス統一

### 3. サービス層実装

**実装ファイル**: `src/lib/engagements.ts`

**主要機能**:
- 匿名キー生成（IP + UserAgent + 秘匿salt のSHA256）
- レート制限管理（メモリベース、5分毎クリーンアップ）
- エンゲージメント計算・表示ユーティリティ
- 事業性判定（購入意向が閾値に達したか）

### 4. UIコンポーネント

#### NeedEngagementButtons
**実装ファイル**: `src/components/needs/NeedEngagementButtons.tsx`

- **未ログイン**: 「気になる」ボタンのみ、押下後にログイン導線表示
- **ログイン済み**: 「購入したい」「興味あり」の2ボタン、選択状態表示、トグル可能
- リアルタイムフィードバック（楽観更新、エラー時復元）
- Toast通知による操作結果表示

#### NeedEngagementBar
**実装ファイル**: `src/components/needs/NeedEngagementBar.tsx`

- **進捗メーター**: purchase/interest/anonymousの可視化
- **閾値インジケーター**: 目標達成ライン表示
- **リアルタイム更新**: SWRで15秒間隔ポーリング
- **事業性表示**: 閾値達成時に「提案開始可能」メッセージ

### 5. 統合実装

#### NeedCard統合
**修正ファイル**: `src/components/NeedCard.tsx`

- エンゲージメントコンポーネントを既存UI内に配置
- 従来の「共感」機能との併存
- レスポンシブ対応

#### Toast Provider追加
**修正ファイル**: `src/app/layout.tsx`

- react-hot-toast のToasterを追加
- 既存のToast systemとの併存

### 6. 環境設定

**追加環境変数**:
```env
ANON_SALT=needport-anonymous-engagement-salt-change-in-production-12345
ANON_RATE_LIMIT=10
```

## セキュリティ対策

### 匿名ユーザー保護
- **匿名キー**: `sha256(IP + UserAgent + ANON_SALT)`でPII非保存
- **重複防止**: 同一人物による同日同ニーズへの重複不可
- **レート制限**: IP単位で1分間10回まで制限

### 認証済みユーザー
- **RLS**: Supabase Row Level Securityで自分のデータのみ操作可能
- **トークン認証**: Clerk JWTによる認証
- **データ整合性**: UNIQUE制約で不正な重複登録防止

## ユーザーフロー

### 未ログインユーザー
1. ニーズカードで「気になる」ボタン押下
2. 匿名で interest カウント増加
3. 「購入意向を示すにはログイン」Toast表示

### ログイン済みユーザー
1. 「興味あり」または「購入したい」選択
2. 選択状態の可視化（✓マーク、色変化）
3. 再押下でトグル（解除）可能

### 事業者側
1. 購入意向が閾値（デフォルト5）に達成
2. 「事業性が確認されました」メッセージ表示
3. 提案機能解禁（将来実装）

## 技術詳細

### データ構造
```sql
-- 需要データ
needs.threshold_pledge: integer (事業性判定の閾値)

-- 認証ユーザーエンゲージメント
need_engagements (need_id, user_id, kind) UNIQUE
  kind: 'interest' | 'pledge'

-- 匿名エンゲージメント  
need_anonymous_interest (need_id, anon_key, day) UNIQUE
```

### API レスポンス例
```json
// GET /api/needs/[id]/engagement/summary
{
  "interest_users": 12,
  "pledge_users": 8, 
  "anon_interest_today": 25,
  "anon_interest_total": 154
}
```

## デプロイ手順

### 1. データベースマイグレーション
```sql
-- Supabaseのクエリエディタで実行
-- ファイル: database/migrations/002-collective-demand.sql
```

### 2. 環境変数設定
```bash
# .env.local または Vercel Environment Variables
ANON_SALT=<高エントロピー文字列>
ANON_RATE_LIMIT=10
```

### 3. アプリケーションデプロイ
```bash
git push origin feat/me-hub-and-auth-nav
npx vercel --prod --confirm  # 本番環境のみ
```

## パフォーマンス考慮

- **SWR キャッシング**: 15秒間隔で効率的なデータ取得
- **楽観更新**: ボタン押下時の即座なUI反応
- **メモリ管理**: レート制限データの定期クリーンアップ
- **インデックス最適化**: need_id, user_id, day カラムにインデックス

## 受入れ基準達成状況

✅ **未ログインで「気になる」ボタンのみ表示** → クリックで200 / summary反映  
✅ **ログイン済みで「購入したい」「興味あり」2ボタン表示**、重複登録不可（トグル可）  
✅ **カード/詳細にメーター + 人数表示**（SWRで自動更新）  
✅ **RLS により匿名は登録可、ユーザー固有の行は漏洩しない**  

## 今後の拡張予定

### Lv2 機能
- 閾値達成時の事業者通知システム
- reCAPTCHA v3 導入によるスパム対策強化
- 複数閾値設定（interest/pledge別）

### Lv3 機能
- AI による需要予測・推奨システム
- 地域・カテゴリ別需要分析
- データ販売機能（匿名化統計）

## まとめ

NeedPortの核心機能「集合的需要の可視化」のLv1実装が完了。匿名性とセキュリティを確保しつつ、直感的なUIで需要の蓄積と可視化を実現。事業性判定の自動化により、効率的なマッチングプラットフォームの基盤が整備されました。