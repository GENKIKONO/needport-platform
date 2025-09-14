# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**v1（Lv1）方針：返金は「運営主導」で実施。自動返金は将来対応（Lv2+）。本版では挙動変更なし・ドキュメントと注記の整合化のみ。**

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (auto-kills ports 3000/3001)
npm run build        # Build for production (skips type checking)
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run unit tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run e2e          # Run Playwright end-to-end tests
npm run e2e:ui       # Run E2E tests with UI
npm run ci           # Run full CI test suite (build + unit + e2e)
npm run rls:check    # Verify RLS policies (requires DATABASE_URL)
```

### Database Operations
```bash
npm run seed         # Seed database with test data
npm run db:seed      # Reset and seed Supabase database
```

### Production Deployment
**CRITICAL**: Only use production deployment mode as specified in README.md:
```bash
npx vercel --prod --confirm  # Deploy to production only
```
- Preview deployments are prohibited
- Only share `https://needport.jp/` links, never vercel.app URLs

## Architecture Overview

### Project Structure
NeedPort is a B2B needs-matching platform transitioning from individual/community focus to B2B functionality. The architecture follows a phased approach:

- **Phase 1**: Feature flags control new B2B functionality
- **Phase 2+**: Full B2B implementation with payments and contracts

### Core Technologies
- **Framework**: Next.js 14.2.5 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Payments**: Stripe (currently disabled via flags)
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E)

### Key Architectural Patterns

#### Feature Flag System
The platform uses multiple feature flag systems:
- `src/lib/config.ts` - MVP configuration flags
- `src/config/flags.ts` - Global feature flags
- Environment variables for runtime configuration

#### Authentication & Middleware
- Clerk middleware in `src/middleware.ts` handles authentication
- Public routes include `/needs`, `/vendors`, and temporarily `/me` (auth disabled for testing)
- Admin routes require special authentication via cookie-based system

#### Database Layer
- Type-safe database interactions via `src/lib/types/database.ts`
- Supabase client configuration with Row Level Security (RLS)
- Schema includes: `profiles`, `needs`, `offers`, `prejoins`, etc.

#### API Architecture
Extensive API layer in `src/app/api/` with clear separation:
- `/api/admin/*` - Administrative functions (requires admin auth)
- `/api/needs/*` - Core needs management
- `/api/me/*` - User-specific operations
- `/api/debug/*` - Development utilities

### B2B Transition Architecture

#### Core Domain Models
- **Need**: User-posted requirements
- **Entry/Offer**: Individual responses (legacy)
- **Endorsement**: B2B support/backing system
- **Proposal**: B2B formal proposals
- **Contract**: B2B agreements with escrow

#### Data Flow
1. **Endorsement Phase**: Users endorse needs until threshold reached
2. **Proposal Phase**: Business proposals submitted and evaluated
3. **Contract Phase**: Agreements with escrow (future implementation)
4. **Review Phase**: Completion and feedback (future implementation)

### UI/Design System

#### NeedPort Design Guidelines
Colors (defined in design guidelines):
- Base: White (`#FFFFFF`)
- Text: Dark gray (`#222222`)
- Subtext: Medium gray (`#666666`)
- Brand: Blue (`#2D9CDB`), Green (`#27AE60`)

Layout principles:
- Maritime/port theme throughout
- Clean, minimal design with ample whitespace
- Responsive design with mobile-first approach

#### Component Organization
- `src/components/` - Reusable UI components
- `src/components/admin/` - Admin-specific components
- `src/components/ui/` - Base UI primitives

### Environment Configuration

#### Critical Environment Variables
- `NEXT_PUBLIC_STRIPE_ENABLED` - Controls payment functionality
- `EXPERIMENTAL_B2B` - Enables B2B features in development
- `NEXT_PUBLIC_SITE_NOINDEX` - Controls search indexing
- `NEXT_PUBLIC_REQUIRE_APPROVAL` - Enables moderation workflow

#### Development vs Production
- Development: Full feature flag control, mock data, local auth
- Production: Strict canonical host enforcement, limited feature exposure

### Testing Strategy

#### Unit Tests
- Located in `src/**/__tests__/`
- Focus on utility functions and business logic
- Run with Vitest for fast feedback

#### E2E Tests
- Playwright tests in `tests/` directory
- Cover critical user journeys
- Include accessibility testing with @axe-core/playwright

### Admin System
Sophisticated admin console with:
- Project approval workflow (localStorage-based in Phase 1)
- Content moderation and status management
- Export/import functionality for data management
- Demo project management with override capabilities

### Performance & Monitoring
- Bundle analysis via `npm run build:analyze`
- Client-side error reporting
- Pageview tracking system
- Performance budgets defined in `scripts/perf-budget.md`

## Development Guidelines

### Working with Feature Flags
Always check feature flag state before implementing new functionality:
```typescript
import { FLAGS } from '@/config/flags';
import { config } from '@/lib/config';

// Global flags
if (FLAGS.UI_V2_DEFAULT) { /* ... */ }

// MVP config
if (config.GUEST_VIEW) { /* ... */ }
```

### Database Changes
1. Update types in `src/lib/types/database.ts`
2. Add seed data to `supabase/seed.sql` for testing
3. Consider RLS policies for production data

### API Development
- Follow existing patterns in `src/app/api/`
- Use proper HTTP status codes and error handling
- Implement rate limiting where appropriate
- Add admin authentication for sensitive endpoints

### Styling Guidelines
- Use Tailwind classes following NeedPort design system
- Responsive design: mobile-first approach
- Consistent spacing and typography
- Maritime theme elements (ports, harbors, sailing metaphors)

---

## 2. NeedPort 要件定義

**バージョン:** 1.0  
**作成日:** 2025年9月13日  
**対象フェーズ:** Lv1 MVP / Lv2 拡張 / Lv3 高度化

### 2.1 プロジェクト概要

#### 2.1.1 サービス名
**NeedPort** - 地域密着型ニーズマッチングプラットフォーム

#### 2.1.2 サービスコンセプト
- **キャッチコピー:** 「欲しい暮らし、10人で叶える」
- **サブコピー:** 「欲しい」と「できる」の橋渡し
- **ミッション:** 匿名性と安全性を確保しながら、地域のニーズと事業者をマッチングする

#### 2.1.3 差別化要因
1. **匿名×安全:** 依頼者PIIを解放前は遮断、本気の事業者のみが10%デポでアクセス
2. **二層モデル:** ベーシック版（自動マッチング）とラグジュアリー版（コンシェルジュ）
3. **データ価値化:** ニーズデータの構造化蓄積による「声の可視化」
4. **日本型商習慣対応:** 見積・相見積・稟議プロセスに最適化された導線

### 2.2 ビジネスモデル・収益構造

#### 2.2.1 ベーシック版
```
ニーズ投稿（匿名・無料）
  ↓
事業者が提案・見積提示
  ↓
閲覧解放デポジット支払い（見積額の10%、ベンダー負担）
  ↓
1:1チャットで詳細調整
  ↓
成約時：デポジットを成功報酬に充当
不成立：運営判断で返金実行（30日経過後、オペレーター手動実行）
※本仕様（v1/Lv1）では自動返金は運用対象外です。将来対応（Lv2+）として別途記載。
```

#### 2.2.2 ラグジュアリー版（コンシェルジュ）
- **着手金:** 20～50万円（案件規模により変動制）
- **成功報酬:** 10～20%（案件により個別設定）
- **専任担当:** 1案件につき1名のコンシェルジュをアサイン
- **サービス内容:** 要件整理・ベンダー推薦・契約進行サポート

#### 2.2.3 収益率・手数料
- **成功報酬率:** 10%（プラットフォーム基本料）
- **解放デポジット:** 見積額の10%（成功時は成功手数料に充当）
- **事業者登録:** L1は無料、L2以降で有料オプション（上限提案件数増枠、検索優先、分析ダッシュボード等）

#### 2.2.4 将来収益モデル（L2以降）
- **データ販売:** 行政・企業向け「声の可視化」データ
- **月額登録:** 一部業種向け月額制
- **エンタープライズ:** SLA・SSO・IP制限等の有料オプション

### 2.3 対象地域・スケール戦略

#### 2.3.1 地域展開方針
- **ブランド:** 全国対応（高知専用ではない）
- **UI設計:** 全国からの投稿受付、事業者は「対応可エリア」を宣言
- **運用展開プラン:**
  - M1-M2: 首都圏・関西・中部を重点エリアとして運用強化
  - M3-M4: 主要政令市へ拡大
  - M6～: 全国同等運用体制へ移行

#### 2.3.2 地域フィルタ要件
- 都道府県→市区町村の階層選択（L1必須）
- 複数地域選択可能
- 事業者の対応エリア表示・検索機能

### 2.4 ユーザー認証・セキュリティ要件

#### 2.4.1 認証基盤
- **認証システム:** Clerk（OAuth2.0 / OIDC対応）
- **認証方法:**
  - メール・パスワード
  - ソーシャルログイン（Google・Apple・LINE）
  - 2FA（時間ベースOTP）

#### 2.4.2 セキュリティレベル
- **L1:** 
  - 管理者2FA必須
  - 事業者2FA推奨（任意）
  - RBAC（user, vendor, ops, admin）
  - 監査ログ・自動バックアップ
- **L2:** 
  - 事業者2FA必須化
  - SAML/OIDC SSO対応
  - IP制限機能
- **L3:** 
  - DLP・秘密情報フィルタ
  - SLA・監査証跡拡充

#### 2.4.3 事業者KYC（Know Your Customer）
**法人の場合**
- 登記簿謄本（履歴事項全部証明書）提出必須
- 反社チェック（帝国データバンク等外部APIサービス利用）
- 代表者本人確認書類

**個人事業主の場合**
- 開業届写し
- 顔写真付き本人確認書類（運転免許証等）
- L2以降：セルフィー + OCRチェック実装

### 2.5 技術的優先順位・開発フェーズ

#### 2.5.1 Lv1（MVP - 最優先リリース）
**必須機能**
- ニーズ投稿・編集・削除
- 事業者提案・見積提示
- 解放デポジット決済（Stripe本番環境）
- 運営主導返金システム（オペレーター判断実行）
- 1:1チャット機能
- 地域・カテゴリ検索・絞り込み
- マイページ（案件管理・決済履歴・プロフィール編集）
- 管理画面（ユーザー審査・通報処理・アカウント凍結・監査ログ・返金管理）
- メール通知システム
- 自動バックアップ
- 集合的需要可視化（"購入したい/興味あり/匿名気になる"のメーターと人数表示、重複抑止込み）

**AI機能**
- 下書き補助（要約・テンプレート提案文生成）

#### 2.5.2 Lv2（拡張フェーズ）
**追加機能**
- マッチング補助（重複ニーズの束ね・候補事業者サジェスト）
- 有料オプション（検索優先・分析ダッシュボード等）
- データ販売機能（匿名化済み統計データ）
- エンタープライズ向けSSO・IP制限
- モバイルアプリ対応

#### 2.5.3 Lv3（高度化フェーズ）
**高度機能**
- AI個別推奨・LTV最適化
- 自動ナッジ機能
- 開発者向けAPIポータル
- 高度分析・レポート機能

### 2.6 機能要件詳細マトリックス

#### 2.6.1 ニーズ一覧ページ
| 機能要素 | 説明 | Lv1 | Lv2 | Lv3 |
|---------|------|-----|-----|-----|
| タイトル/サブ説明 | 一覧ページの見出し | ● | ● | ● |
| 検索バー | キーワード検索 | ● | ● | ● |
| エリア選択 | 都道府県→市区町村 | ● | ● | ● |
| カテゴリ選択 | ニーズ種別絞り込み | ● | ● | ● |
| ソート切替 | 新着/人気/締切順 | ● | ● | ● |
| ニーズカード表示 | タイトル/概要/タグ | ● | ● | ● |
| ステータス表示 | 進行中/終了 | ● | ● | ● |
| ページネーション | 一覧回遊性確保 | ● | ● | ● |
| 人気カテゴリ表示 | 行動履歴による導線 |   | ● | ● |

#### 2.6.2 ニーズ投稿ページ
| 機能要素 | 説明 | Lv1 | Lv2 | Lv3 |
|---------|------|-----|-----|-----|
| 区分選択 | 個人/企業/自治体 | ● | ● | ● |
| タイトル/詳細入力 | 投稿内容記載 | ● | ● | ● |
| エリア指定 | 都道府県→市区町村 | ● | ● | ● |
| カテゴリ選択 | 適切な分類 | ● | ● | ● |
| 予算・希望条件 | 事業者向け情報 | ● | ● | ● |
| 添付ファイル | 画像/資料アップロード | ● | ● | ● |
| 公開設定 | 公開/非公開/プレビュー | ● | ● | ● |

#### 2.6.3 事業者登録ページ
| 機能要素 | 説明 | Lv1 | Lv2 | Lv3 |
|---------|------|-----|-----|-----|
| 基本情報入力 | 法人/個人事業主区分 | ● | ● | ● |
| 業務内容/対応エリア | サービス範囲明示 | ● | ● | ● |
| ロゴ/許認可証アップロード | 信頼性補強 | ● | ● | ● |
| アカウント情報 | メール/パスワード | ● | ● | ● |
| 2FA設定 | セキュリティ強化 |   | ● | ● |
| KYC書類提出 | 本人・法人確認 | ● | ● | ● |

#### 2.6.4 決済・エスクロー機能
| 機能要素 | 説明 | Lv1 | Lv2 | Lv3 |
|---------|------|-----|-----|-----|
| 解放デポジット決済 | 見積額10%の前払い | ● | ● | ● |
| 成功報酬充当 | デポジット自動充当 | ● | ● | ● |
| 運営主導返金処理 | 管理者判断による返金 | ● | － | － |
| 自動返金処理※ | 30日後不成立返金（将来対応） | － | ● | ● |
| 領収書発行 | PDF自動生成 | ● | ● | ● |
| エスクロー管理 | Stripe標準運用 | ● | ● | ● |

#### 2.6.5 チャット・コミュニケーション
| 機能要素 | 説明 | Lv1 | Lv2 | Lv3 |
|---------|------|-----|-----|-----|
| 1:1チャット | 双方向メッセージング | ● | ● | ● |
| ファイル送信 | 資料共有機能 | ● | ● | ● |
| 未読通知 | リアルタイム通知 | ● | ● | ● |
| 監査ログ | 履歴保存・出力 | ● | ● | ● |
| AI補助機能 | 要約・提案ドラフト |   |   | ● |

### 2.7 運用要件

#### 2.7.1 カスタマーサポート体制
- **営業時間:** 平日10:00～18:00
- **対応チャネル:**
  - メール（全ユーザー）
  - チャットボット（一次対応）
  - 電話（ラグジュアリー版のみ）
- **多言語対応:** 日本語のみ（L1）、英語対応はL2以降

#### 2.7.2 通報・不正対応
- **通報受付:** 24時間フォーム受付
- **初期対応SLA:** 24時間以内に一次回答
- **最終判断SLA:** 深刻案件は72時間以内（アカウント停止・返金等）
- **対応フロー:**
  1. 自動受付・緊急度判定
  2. 運営チーム一次調査
  3. 必要に応じて当事者ヒアリング
  4. 最終判断・措置実行・結果通知

#### 2.7.3 データバックアップ・DR
- **自動バックアップ:** 日次（フルバックアップ）
- **リテンション:** 30日間
- **RTO（目標復旧時間）:** 4時間以内
- **RPO（目標復旧地点）:** 24時間以内

### 2.8 非機能要件

#### 2.8.1 パフォーマンス要件
- **応答時間:** 2秒以内（90%ile）
- **同時接続数:** 1,000ユーザー（L1）、10,000ユーザー（L2以降）
- **可用性:** 99.9%（L1）、99.95%（L2以降）

#### 2.8.2 スケーラビリティ
- **アーキテクチャ:** マイクロサービス対応可能な設計
- **データベース:** 水平スケール可能な構成
- **CDN:** 静的コンテンツ配信最適化

#### 2.8.3 セキュリティ要件
- **データ暗号化:** 転送時・保存時ともに暗号化
- **アクセス制御:** RBAC + 最小権限原則
- **ログ監査:** 全アクセス・操作ログの記録・保持
- **脆弱性対策:** 定期的なセキュリティスキャン・ペネトレーションテスト

### 2.9 データ活用・プライバシー

#### 2.9.1 データ収集・活用方針
- **収集データ:**
  - ユーザー行動ログ
  - ニーズ・提案内容（匿名化済み）
  - マッチング成功・失敗パターン
  - 地域・カテゴリ別トレンド

#### 2.9.2 プライバシー保護
- **個人情報保護:**
  - PIIは解放前マスク処理
  - 統計処理時の完全匿名化
  - GDPR・個人情報保護法準拠
- **同意取得:**
  - 投稿時に「匿名化データの調査・分析利用」チェックボックス必須
  - オプトアウト機能提供

#### 2.9.3 データ販売（L2以降）
- **対象:** 行政機関・企業の政策・商品開発部門
- **提供形式:** 統計サマリー・トレンドレポート
- **個人特定不可:** 完全匿名化データのみ外部提供

### 2.10 決済・返金ポリシー v1.0（Lv1運用）

#### 2.10.1 運営主導返金システム
- **基本方針**: 全ての返金は管理者による手動判断・承認を経て実行
- **自動返金なし**: システムによる自動返金は実装せず、運用対象外
- **24時間ルール**: 連絡先アクセス後24時間は返金申請制限（コード実装済み）
- **30日経過後**: 管理者に通知→手動判断で返金実行

#### 2.10.2 ユーザー向け表示方針
- **統一文言**: 「返金は運営による確認後に処理されます」
- **明示**: 「自動返金は行われません」  
- **制限告知**: 「連絡先アクセス後24時間は返金申請できません」

#### 2.10.3 運用フロー
```
デポジット決済 → エスクロー保留
    ↓
連絡先アクセス後24時間: ユーザー返金申請不可
    ↓  
30日経過: 管理者に通知 → 手動判断で返金実行
```

### 2.11 将来対応（Lv2以降）

#### 2.11.1 自動返金システム（実装予定）
- **Stripe Webhook**: 30日後の自動返金処理
- **条件分岐**: より柔軟な返金条件設定
- **高度エスクロー**: 複数段階の自動化処理

#### 2.11.2 実装方針
- **段階的導入**: Lv1の運営主導システムを基盤として拡張
- **既存互換**: 現在のAPIエンドポイント・データ構造を維持
- **運営併用**: 自動化導入後も管理者判断を併用

### 2.12 成功指標・KPI

#### 2.12.1 L1（MVP）目標指標
- **ユーザー登録数:** 1,000名（3ヶ月）
- **事業者登録数:** 100社（3ヶ月）  
- **月間マッチング件数:** 50件
- **成約率:** 20%以上
- **ユーザー満足度:** 4.0/5.0以上

#### 2.12.2 L2（拡張）目標指標
- **ユーザー登録数:** 10,000名
- **事業者登録数:** 1,000社
- **月間マッチング件数:** 500件
- **成約率:** 30%以上
- **収益:** 月次100万円

#### 2.12.3 L3（高度化）目標指標
- **ユーザー登録数:** 50,000名
- **事業者登録数:** 5,000社
- **月間マッチング件数:** 2,000件
- **成約率:** 40%以上
- **収益:** 月次500万円

---

# 要件定義書 (Requirements Specification)

## 1. プロジェクト概要

### 1.1 プロジェクト名
**NeedPort Platform** - ニーズマッチングプラットフォーム

### 1.2 目的・背景
地域の個人・コミュニティのニーズと事業者をマッチングするプラットフォーム。従来の個人向けサービスから段階的にB2B機能を拡充し、より大規模で継続的な取引を可能にする。

### 1.3 プロジェクト範囲
- **Phase 1**: 既存個人向け機能の維持 + B2B機能のプロトタイプ実装
- **Phase 2+**: 決済システム統合、契約管理、エスクロー機能の本格実装

### 1.4 対象ユーザー
- **一般ユーザー**: ニーズを投稿する個人・コミュニティ
- **事業者**: ニーズに対してサービスを提供する企業・個人事業主
- **管理者**: プラットフォーム運営・モデレーション担当

## 2. 機能要件

### 2.1 コア機能

#### 2.1.1 ニーズ投稿機能
- **機能概要**: ユーザーがニーズ（要望・困りごと）を投稿
- **入力項目**:
  - タイトル（必須）
  - カテゴリ（必須）: リフォーム・建築、移動・送迎、家事・生活支援、不動産、その他
  - 地域（必須）
  - 要約（任意）
  - 詳細説明（必須）
  - 連絡先情報（メール、電話、住所）
- **機能詳細**:
  - 連絡先情報は提案者のみに表示（プライバシー保護）
  - 投稿後は一覧・詳細ページで閲覧可能
  - 海・港をテーマとしたUI（「航海を始める」「港に投稿」等）

#### 2.1.2 ニーズ一覧・検索機能
- **機能概要**: 投稿されたニーズの閲覧・検索
- **表示内容**:
  - ニーズカード形式での一覧表示
  - タイトル、要約、地域タグ、投稿日時
  - カテゴリ別フィルタリング
  - 地域別絞り込み
- **デザイン要件**:
  - レスポンシブ対応（PC: 横4列、タブレット: 横2列、モバイル: 縦1列）
  - NeedPortデザインガイドライン準拠

#### 2.1.3 マイページ機能
- **機能概要**: ユーザーの個人ダッシュボード
- **主要セクション**:
  - ステータスカード: 航海中の取引、投稿したニーズ、港からの信号、提案した案件
  - サイドナビゲーション: ニーズ管理、取引管理、決済・領収書、チャット履歴、投稿管理、応募案件、プロフィール、設定
  - 航海ログ: 最近の活動履歴
  - クイックアクション: 新規投稿、ニーズ検索
  - 航海ガイド: ヘルプ・FAQ・お問い合わせ
- **レイアウト要件**:
  - PC画面: 2:6:2の比率（左余白:コンテンツ:右余白）
  - ステータスカードは4つ横並び
  - 適切な情報密度で視認性重視

### 2.2 B2B拡張機能（段階的実装）

#### 2.2.1 賛同システム
- **Phase 1**: デモ実装（決定論的数値生成）
- **表示条件**: `EXPERIMENTAL_B2B=1` かつ `NEXT_PUBLIC_SITE_NOINDEX=1`
- **機能**: ニーズへの賛同数表示、閾値到達で提案解禁

#### 2.2.2 提案比較機能
- **Phase 1**: ダミーデータでの3件提案表示
- **機能**: 価格・期間でのソート、比較テーブル表示
- **Phase 2+**: 実際の提案データとの連携

#### 2.2.3 管理者コンソール（Admin Console）
- **Phase 1**: ローカルストレージベースの管理画面
- **機能**:
  - プロジェクト承認ワークフロー（pending → approved）
  - ステータス管理、カテゴリ変更
  - コメント機能
  - Export/Import機能
  - cURL生成機能

### 2.3 認証・権限管理

#### 2.3.1 認証システム
- **認証プロバイダー**: Clerk
- **認証方式**: ログイン・登録画面での認証
- **権限レベル**: user, pro, ops, mod, admin

#### 2.3.2 ルートアクセス制御
- **パブリックルート**: `/`, `/needs`, `/vendors`, `/me`（一時的）
- **管理者ルート**: `/admin`, `/api/admin` - 特別認証が必要
- **API認証**: JWTトークンベース + Cookie認証

## 3. 非機能要件

### 3.1 デザイン要件

#### 3.1.1 NeedPortデザインガイドライン
- **基本方針**: 白ベースで清潔感と信頼感重視
- **カラーパレット**:
  - ベースカラー: 白 (`#FFFFFF`)
  - テキストカラー: ダークグレー (`#222222`)
  - サブテキスト: ミディアムグレー (`#666666`)
  - ブランドアクセント: ブルー (`#2D9CDB`)、グリーン (`#27AE60`)
- **テーマ**: 港・海をモチーフとした海洋テーマ
- **フォント**: Sans-serif（Noto Sans JP推奨）

#### 3.1.2 レスポンシブデザイン
- **ブレークポイント**: モバイルファースト設計
- **PC画面**: 最大幅1200px、中央寄せレイアウト
- **タブレット**: 適切な余白調整、2列表示
- **モバイル**: 1列表示、タップしやすいボタンサイズ（最小44px）

### 3.2 パフォーマンス要件
- **ページ読み込み**: 3秒以内（First Contentful Paint）
- **バンドルサイズ**: 最適化済み、動的インポートの活用
- **画像最適化**: Sharp による自動最適化

### 3.3 セキュリティ要件
- **データ保護**: Supabase RLS（Row Level Security）
- **個人情報**: PII伏字化システム
- **CSRF対策**: CSRFトークンによる保護
- **レート制限**: API呼び出し制限

### 3.4 運用要件

#### 3.4.1 デプロイメント
- **本番環境**: Vercel
- **デプロイルール**: `npx vercel --prod --confirm` のみ使用
- **プレビュー禁止**: プレビューデプロイメントは使用禁止

#### 3.4.2 監視・ログ
- **エラー監視**: Sentry統合
- **アクセス解析**: Vercel Analytics
- **パフォーマンス監視**: 定期的なLighthouse監査

## 4. 技術仕様

### 4.1 システム構成
- **フロントエンド**: Next.js 14.2.5 (App Router)
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: Clerk
- **決済**: Stripe（Phase 2で本格実装）
- **デプロイ**: Vercel

### 4.2 データベース設計

#### 4.2.1 主要テーブル
- **profiles**: ユーザープロフィール情報
- **needs**: ニーズ投稿データ
- **offers**: 提案・オファー情報
- **prejoins**: 事前登録データ
- **endorsements**: B2B賛同システム（Phase 2+）
- **proposals**: B2B提案システム（Phase 2+）
- **contracts**: 契約管理（Phase 2+）

#### 4.2.2 データ型定義
- TypeScript型定義: `src/lib/types/database.ts`
- Zodスキーマ: `src/lib/schemas.ts`

### 4.3 API設計

#### 4.3.1 エンドポイント設計
- **RESTful API**: 標準的なHTTPメソッド使用
- **エラーハンドリング**: 適切なHTTPステータスコード
- **レスポンス形式**: JSON標準

#### 4.3.2 認証・認可
- **JWT**: Clerkトークンベース認証
- **Cookie**: 管理者認証用補助システム
- **RLS**: データベースレベルでの権限制御

## 5. 開発・運用フロー

### 5.1 開発フロー
1. **機能要件確認**: Phase定義に基づく機能実装
2. **フィーチャーフラグ**: 段階的リリースの制御
3. **テスト**: 単体テスト（Vitest） + E2Eテスト（Playwright）
4. **レビュー**: コードレビュー + デザインレビュー
5. **デプロイ**: 本番環境への直接デプロイ

### 5.2 品質保証
- **型安全**: TypeScript strict mode
- **Linting**: ESLint + Prettier
- **Testing**: 高いテストカバレッジ維持
- **Accessibility**: axe-coreによるアクセシビリティテスト

### 5.3 リリース戦略
- **段階的リリース**: フィーチャーフラグによる制御
- **カナリアリリース**: 特定ユーザーグループでの先行テスト
- **ロールバック対応**: 即座に前バージョンへ戻せる仕組み

## 6. 制約・前提条件

### 6.1 技術的制約
- **Node.js**: v20.x固定
- **Next.js**: App Router使用必須
- **デプロイ**: Vercel専用（他プラットフォーム不可）

### 6.2 ビジネス制約
- **Phase 1**: 決済機能は画面表示のみ（実際の課金なし）
- **地域制限**: 当初は日本国内のみ対応
- **言語**: 日本語UIのみ

### 6.3 運用制約
- **プレビュー禁止**: 開発中もプレビューデプロイメント使用不可
- **URLシェア**: needport.jp ドメインのみ共有可能
- **管理者権限**: Cookie認証による簡易実装（Phase 1）

---

この要件定義書は、NeedPortプラットフォームの現状と将来計画を包括的に記載したものです。開発時は本要件に基づき、段階的な機能実装を行ってください。

---

# Next.js ベストプラクティス

## 1. App Router パターン

### 1.1 ディレクトリ構造
```
src/app/
├── layout.tsx          # ルートレイアウト
├── page.tsx           # ホームページ
├── globals.css        # グローバルスタイル
├── needs/
│   ├── page.tsx       # /needs
│   ├── new/
│   │   └── page.tsx   # /needs/new
│   └── [id]/
│       └── page.tsx   # /needs/[id]
├── api/
│   ├── needs/
│   │   └── route.ts   # API Routes
│   └── admin/
└── (admin)/           # Route Groups
    └── admin/
        └── page.tsx
```

### 1.2 ファイル命名規則
- **page.tsx**: ページコンポーネント
- **layout.tsx**: レイアウトコンポーネント
- **loading.tsx**: ローディングUI
- **error.tsx**: エラーUI
- **not-found.tsx**: 404ページ
- **route.ts**: API Routes

## 2. サーバー・クライアントコンポーネント

### 2.1 サーバーコンポーネント（デフォルト）
```typescript
// データフェッチはサーバーサイドで実行
export default async function NeedsPage() {
  const needs = await fetchNeeds(); // サーバーサイドで実行
  
  return (
    <div>
      {needs.map(need => (
        <NeedCard key={need.id} need={need} />
      ))}
    </div>
  );
}
```

### 2.2 クライアントコンポーネント
```typescript
"use client"; // クライアントコンポーネントの明示

import { useState } from "react";

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 2.3 使い分けの原則
- **サーバーコンポーネント使用時**:
  - データフェッチが必要
  - 状態管理不要
  - イベントハンドラー不要
  - SEOが重要

- **クライアントコンポーネント使用時**:
  - `useState`, `useEffect` 使用
  - イベントハンドラー必要
  - ブラウザAPIアクセス
  - リアルタイム更新

## 3. データフェッチパターン

### 3.1 サーバーサイドデータフェッチ
```typescript
// app/needs/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function NeedsPage() {
  const supabase = createClient();
  const { data: needs } = await supabase
    .from('needs')
    .select('*')
    .order('created_at', { ascending: false });

  return <NeedsList needs={needs} />;
}
```

### 3.2 クライアントサイドデータフェッチ
```typescript
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ClientNeedsPage() {
  const [needs, setNeeds] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNeeds() {
      const { data } = await supabase.from('needs').select('*');
      setNeeds(data || []);
    }
    fetchNeeds();
  }, []);

  return <NeedsList needs={needs} />;
}
```

### 3.3 キャッシュ戦略
```typescript
// 静的生成 + ISR
export const revalidate = 3600; // 1時間ごとに再生成

// 動的レンダリング
export const dynamic = 'force-dynamic';

// 特定のfetch()のキャッシュ制御
const response = await fetch('/api/needs', {
  next: { revalidate: 60 } // 60秒キャッシュ
});
```

## 4. API Routes パターン

### 4.1 基本的なAPI Route
```typescript
// app/api/needs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('needs')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch needs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('needs')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create need' },
      { status: 500 }
    );
  }
}
```

### 4.2 動的ルートAPI
```typescript
// app/api/needs/[id]/route.ts
interface Params {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const { id } = params;
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from('needs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Need not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
```

## 5. メタデータとSEO

### 5.1 静的メタデータ
```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeedPort - ニーズマッチングプラットフォーム',
  description: '地域のニーズと事業者をつなぐプラットフォーム',
  keywords: ['ニーズ', 'マッチング', '地域', '事業者'],
};
```

### 5.2 動的メタデータ
```typescript
// app/needs/[id]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const need = await fetchNeed(params.id);
  
  return {
    title: `${need.title} | NeedPort`,
    description: need.summary,
    openGraph: {
      title: need.title,
      description: need.summary,
      url: `/needs/${need.id}`,
    },
  };
}
```

## 6. パフォーマンス最適化

### 6.1 画像最適化
```typescript
import Image from 'next/image';

// 適切な画像最適化
<Image
  src="/hero-image.jpg"
  alt="NeedPortのヒーロー画像"
  width={1200}
  height={600}
  priority // LCPの改善
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 6.2 動的インポート
```typescript
import dynamic from 'next/dynamic';

// 重いコンポーネントの遅延読み込み
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>チャート読み込み中...</div>,
  ssr: false // クライアントサイドでのみ実行
});
```

### 6.3 フォント最適化
```typescript
// app/layout.tsx
import { Inter, Noto_Sans_JP } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap'
});
```

## 7. エラーハンドリング

### 7.1 エラーページ
```typescript
// app/error.tsx
'use client';

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>
        再試行
      </button>
    </div>
  );
}
```

### 7.2 Not Foundページ
```typescript
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h2>ページが見つかりません</h2>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/">
        ホームに戻る
      </Link>
    </div>
  );
}
```

## 8. セキュリティベストプラクティス

### 8.1 環境変数管理
```typescript
// 公開環境変数（NEXT_PUBLIC_プレフィックス）
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

// プライベート環境変数（サーバーサイドのみ）
const secretKey = process.env.SECRET_KEY;
```

### 8.2 CSP設定
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

## 9. NeedPort固有のパターン

### 9.1 フィーチャーフラグの使用
```typescript
import { FLAGS } from '@/config/flags';
import { config } from '@/lib/config';

export default function ConditionalFeature() {
  // 環境変数ベースのフラグ
  if (!FLAGS.UI_V2_DEFAULT) {
    return <LegacyComponent />;
  }

  // 設定ベースのフラグ
  if (config.MVP_MODE) {
    return <MockComponent />;
  }

  return <NewFeatureComponent />;
}
```

### 9.2 認証統合パターン
```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <h1>こんにちは、{user?.firstName}さん</h1>
    </div>
  );
}
```

### 9.3 Supabase統合パターン
```typescript
// サーバーコンポーネント
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = createClient();
  const { data } = await supabase.from('needs').select('*');
  
  return <div>{/* レンダリング */}</div>;
}

// クライアントコンポーネント
"use client";
import { createClient } from '@/lib/supabase/client';

export default function ClientComponent() {
  const supabase = createClient();
  // useEffectでデータフェッチ
}
```

## 10. 開発時の注意事項

### 10.1 型安全性
- TypeScript strict mode有効
- Zodスキーマを使用したランタイム型検証
- データベース型定義の活用

### 10.2 パフォーマンス監視
```bash
# バンドル分析
npm run build:analyze

# Lighthouse監査
npm run lighthouse
```

### 10.3 アクセシビリティ
- セマンティックHTML使用
- ARIA属性の適切な設定
- キーボードナビゲーション対応
- カラーコントラスト確保

---

# TODO管理ガイドライン

## タスク管理の基本原則

### チェックボックス形式
各機能チケットファイル内では以下の形式でTODO管理を行います：

- `- [ ]` 未完了タスク
- `- [x]` 完了タスク

### 例:
```markdown
### 機能要件
- [ ] ニーズ投稿機能の実装
- [x] ニーズ一覧表示機能の実装
- [ ] ニーズ詳細表示機能の実装
```

### 進捗管理ルール

1. **タスク開始時**: `- [ ]` のまま作業開始
2. **タスク完了時**: `- [x]` に変更して完了マーク
3. **定期レビュー**: 各チケットの進捗を定期的に確認
4. **依存関係管理**: 前提条件が完了してから次のタスクに着手

### ファイル構成
```
docs/
├── 001-user-authentication.md     # ユーザー認証機能
├── 002-needs-management.md        # ニーズ管理機能
├── 003-offer-system.md           # オファー・応募システム
├── 004-payment-system.md         # 決済システム
├── 005-messaging-system.md       # メッセージングシステム
├── 006-project-management.md     # プロジェクト管理機能
├── 007-admin-panel.md            # 管理者パネル
├── 008-ui-components.md          # UIコンポーネントシステム
├── 009-api-integration.md        # API統合・最適化
└── 010-testing-deployment.md     # テスト・デプロイメント
```

### 使用方法
1. 機能開発開始時に該当チケットファイルを確認
2. 実装すべきタスクを `- [ ]` で管理
3. 完了したタスクは即座に `- [x]` に更新
4. 全タスク完了時に次の依存チケットに着手

これにより、プロジェクト全体の進捗が可視化され、効率的な開発が可能になります。

---

## Posting Flow Contract & Guardrails (Lv1)

### API Contract Requirements
- **POST /api/needs**: Must create drafts with `status: 'draft'` 
- **POST /api/needs/new**: Simplified posting with fallbacks, `status: 'draft'`
- **Authentication**: All posting endpoints require valid Clerk JWT
- **Response Format**: JSON only, never HTML error pages
- **RLS Compliance**: Server client passes Clerk tokens to Supabase

### RLS Policies Canonical Set
Required policies for needs table:
- `public read needs`: SELECT with `status = 'published'` restriction
- `needs_insert_draft`: INSERT for authenticated users with `status = 'draft'` check
- Engagement tables (`need_engagements`, `need_anonymous_interest`): Similar authenticated access

### Collective Demand (Interest/Pledge/Anonymous)

**API**
- `POST /api/needs/[id]/engagement { kind: 'interest'|'pledge' }`
  - 未ログイン：kind='interest' を匿名テーブルへ（IP+UA+saltのハッシュで日単位重複抑止、ユニーク衝突は200の冪等扱い）
  - ログイン済み：need_engagements へ upsert（unique(need_id,user_id,kind)、トグル可）
- `GET /api/needs/[id]/engagement/summary → { interest_users, pledge_users, anon_interest_today, anon_interest_total }`

**UI**
- NeedCard / NeedDetail に二重バー（pledge=濃色、interest=淡色、anon=点線）、右側に人数表示
- 未ログインは「気になる」のみ（押下後にログイン導線トースト）
- SWRで15sポーリング or 楽観更新

**RLS（要件のみ。実SQLは別ファイルに）**
- need_engagements：INSERT/SELECT authenticated、unique(need_id,user_id,kind)
- need_anonymous_interest：INSERT/SELECT anon,authenticated、unique(need_id,anon_key,day)

**受入れ基準（Lv1）**
- 未ログイン「気になる」→200でsummaryが増える
- ログイン「興味あり/購入したい」→重複不可/トグル可
- カード/詳細でメーターと人数が見える（SWR更新）
- RLSで匿名は登録可・user行は漏洩なし

### Navigation & UI Drift Prevention
**Header Navigation** (required):
- Brand: "NeedPort" → `/`
- ニーズ一覧 → `/needs`  
- 事業者一覧 → `/vendors`
- マイページ → `/me` (authenticated)
- ログイン (unauthenticated)

**Hero Copy Requirements**:
- Primary: "欲しい暮らし、10人で叶える"
- Secondary: "「欲しい」と「できる」の橋渡し"
- Maritime theme throughout

**My Page Structure**:
- 4-column status cards (航海中の取引, 投稿したニーズ, 港からの信号, 提案した案件)
- Sidebar: ニーズ管理, 取引管理, 決済・領収書, チャット履歴, プロフィール, 設定, ログアウト
- Quick actions: 新規投稿, ニーズ検索

**Header/Auth Rules**:
- 未ログイン: 「ログイン」表示（一般ログイン/事業者ログインは統合）
- ログイン時: 「マイページ」表示に切替
- チャット、ログアウトはヘッダーから除外、マイページ内に集約

### ESLint Guardrails
Enforced rules:
- No direct `process.env.*` usage outside `/src/lib/config/`
- No direct Supabase client creation outside `/src/lib/supabase/`  
- No require() in app/ (ESM imports only)
- Header component restrictions (use AppHeader)

### Test Coverage Requirements
- **Unit Tests**: API routes, auth integration, validation
- **E2E Tests**: Posting flow, authentication, error handling
- **RLS Tests**: Policy verification, access control
- **UI Drift Tests**: Navigation, hero copy, component structure

### Health Monitoring
- `/api/health`: Returns version, git SHA, environment checks
- CI pipeline: Build → Test → E2E → Deploy
- RLS verification: `npm run rls:check`

---

## 変更履歴

### 2025-09-14 テスト・品質管理インフラ追加
- **追加内容**: API契約テスト、RLS検証、E2Eテスト、UIドリフト防止テスト
- **新ファイル**: tests/api/, tests/rls/, tests/e2e/, tests/ui/, scripts/sql/
- **CI強化**: GitHub Actions ワークフロー、ESLintルール追加
- **ヘルスチェック**: /api/health エンドポイント追加
- **npm scripts**: ci, rls:check コマンド追加

### 2025-09-13 決済・返金仕様統一
- **変更内容**: Lv1を運営主導返金に統一、自動返金表現を将来対応に移動
- **対象**: 2.2.1ベーシック版（218行目注記追加）、2.6.4決済・エスクロー機能テーブル（運営主導/自動返金の分離）
- **追加**: 2.10決済・返金ポリシーv1.0、2.11将来対応セクション
- **番号調整**: 旧2.10成功指標・KPIを2.12に繰り下げ
- **コミット**: [差分確認後に記載予定]