# NeedPort B2B ピボット仕様書

## 概要
NeedPort の B2B 化に向けた Phase 1 実装。既存の個人/コミュニティ向け機能は変更せず、B2B 機能を段階的に追加。

## 語彙定義

### 既存（変更なし）
- **Need**: ニーズ投稿
- **Entry**: エントリー（個人向け）
- **Offer**: オファー（個人向け）

### B2B 新規
- **Endorsement**: 賛同（Need への支持）
- **Proposal**: 提案（B2B 向け）
- **Contract**: 契約
- **Review**: レビュー
- **Escrow**: エスクロー

## フロー概要

### 1. 賛同フェーズ
1. ユーザーが Need に賛同（Endorsement）
2. 賛同数が閾値に達すると提案解禁
3. 提案者（Proposer）が提案を作成

### 2. 提案フェーズ
1. 提案者が詳細な提案書を作成
2. クライアントが提案を評価
3. 採用決定

### 3. 契約フェーズ
1. 契約書作成
2. エスクロー入金
3. 作業開始

### 4. レビューフェーズ
1. 作業完了
2. レビュー投稿
3. エスクロー決済

## 技術仕様

### Phase 1（現在）
- フィーチャーフラグによる制御
- API は 501 で未実装
- 型定義とスキーマ雛形のみ
- UI 文言の調整

### Phase 2（将来）
- 決済連携（Stripe）
- 認証連携（Clerk）
- エスクロー機能
- 通知システム

## 賛同ピル（Phase 1.5）

### 概要
賛同ピルは Phase 1 のダミー実装であり、実際のデータベースやAPIを参照しません。

### 表示条件
- `EXPERIMENTAL_B2B=1` かつ `NEXT_PUBLIC_SITE_NOINDEX=1` の両方が有効
- どちらかが `0` の場合は表示されない

### 数値生成
- 決定論的生成：同じ Need に対して常に同じ数値（3〜9の範囲）
- シード：`need.id` または `need.title + '|' + need.createdAt`
- 生成関数：`demoEndorseCount()` （DJB2ハッシュベース）

### テスト保証
- 表示条件のテスト：フラグの組み合わせパターンを網羅
- 決定論性のテスト：同じシードで同じ結果を保証
- ネットワーク呼び出し：増加なしを保証

### API差し替え時の注意
Phase 2 で実装する際は、`demoEndorseCount()` を実際のAPI呼び出しに置換してください。
UI契約（表示条件、data属性、クラス名）は変更しないでください。

### 提案比較UI（Phase 1.8）
提案比較UIは Phase-1 のダミー表示であり、フラグON＋noindex時のみ露出します。
価格/期間でソート可能なテーブル形式で3件のダミー提案を表示します。
API差し替え時は `demoProposals()` を実データに置換してください。

### 技術メモ
- `variant()` はストレージDI対応。テストやSSRでは引数ストレージを渡すことで安定性を向上
- メモリストレージフォールバックにより、localStorageが利用できない環境でも動作

### Admin Demo Console（Phase 1.9）
Admin Demo Console は UI のみの実装で、localStorage保存、Cookieで簡易ログイン、APIは全501の安全な実装です。

#### 範囲
- **UIのみ**: すべての操作はローカルにのみ反映
- **localStorage保存**: プロジェクトデータはブラウザに保存
- **Cookieで簡易ログイン**: `admin=1` Cookieで認証状態管理
- **APIは全501**: 将来の受け口として雛形のみ配置

#### 本番化プラン
承認ワークフロー（pending→approved）をB2Bスキーマに接続する手順：
1. `AdminProject` 型を実際のDBスキーマにマッピング
2. `loadProjects()` / `saveProjects()` をAPI呼び出しに置換
3. 承認・却下・削除APIを実装（現在は501）
4. コメント機能を実際のDBに接続

#### DEMOバッジの出し方
- `demoIds()` 経由: デモプロジェクトのIDリストを取得
- `NEXT_PUBLIC_SHOW_DEMO=1`: フラグONでバッジ表示
- NeedCardで条件判定: `demoIds().includes(need.id)` で表示制御

### 承認制モデレーション（Phase 1.10）
承認制（Phase-1.10）はUIオーバーレイのみの実装で、`NEXT_PUBLIC_REQUIRE_APPROVAL=1` で公開抑止を行います。Admin操作はlocalStorage保存で即時反映されます。

#### 範囲
- **UIオーバーレイ**: `mod-overlay.ts` でlocalStorageベースの状態管理
- **公開制御**: `isPubliclyVisible()` で承認済みのみ表示
- **バッジ表示**: 優先順位（rejected > pending > demo > approved）
- **審査中オーバーレイ**: pending状態で半透明オーバーレイ表示

#### 本番化プラン
本番化では Admin API（501）へ接続し、RLS＋監査ログ＋永続テーブルに昇格する手順：
1. `mod-overlay.ts` の状態をDBスキーマに移行
2. `setStatus()` / `setCategory()` をAPI呼び出しに置換
3. 承認ワークフローを永続化（監査ログ付き）
4. RLSポリシーで公開制御を実装

### 賛同オーバーライド＆解禁演出（Phase 1.11）
賛同数オーバーライド、解禁バッジ、Hireモーダル（無効）、AdminのExport/ImportとcURL生成機能を実装しました。

#### 範囲
- **賛同オーバーライド**: Adminで手動設定可能（0〜999）
- **解禁バッジ**: 閾値以上で「解禁」バッジ表示、ProposalCompare自動展開
- **Hireモーダル**: 無効状態でマイルストーン表示（決済OFF時）
- **Admin Export/Import**: JSON形式でローカル状態の保存・復元
- **cURL生成**: 実案件作成用のコマンドをクリップボードにコピー

#### 本番化プラン
本番化時は以下の置換を行います：
- `setEndorseCount()` → endorsementsテーブル更新
- Hireモーダル → `/proposals/:id/hire` APIに接続
- Export/Import → 実際のDBスキーマ対応
- cURL生成 → 認証付きAPIコールに変更

## 既存機能との互換性
- `/api/needs` の RLS-safe insert は変更なし
- 個人向け機能はそのまま維持
- データベーススキーマは段階的に拡張

## セキュリティ
- RLS ポリシーは後で実装
- 外部キー制約は後で実装
- 決済関連は完全に分離
