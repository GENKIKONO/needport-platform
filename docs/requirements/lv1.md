# NeedPort Lv1 Requirements

## 集合的需要可視化（Lv1）— 最小実装

目的：NeedPortの本来要件「1つのニーズに複数ユーザーの購入意向を集め、事業性が見えたら提案が起きる」をLv1に明示し、最小実装を追加する。

### 1) 要件定義の追記
- 未ログイン：ニーズカードに「気になる」だけ押下可（匿名カウント）。押下後にログイン導線。
- ログイン済み：
  - ボタン：①購入したい（= pledge）②興味あり（= interest）
  - 同一ユーザーの重複は不可（トグル可）。
- 表示：カードにメーター（interest/pledgeの本数 or 二重バー）と人数表示（例：購入したい 12 / 興味あり 37 / 気になる 154）。
- 集計はリアルタイム近似（SWR/ISRでOK）。
- プライバシー：匿名"気になる"はIP+UAのハッシュで日単位重複抑止、PIIは保持しない。

### 2) スキーマ（Supabase / Postgres）
- 既存needsテーブルはそのまま利用
- engagement_kind enum（'interest','pledge'）
- need_engagements、need_anonymous_interest テーブル（上記要件）
- RLS：engagementsはauthenticated insert/select、anonymous_interestはanonもinsert/select可

### 3) API
- POST /api/needs/[id]/engagement
- GET /api/needs/[id]/engagement/summary

### 4) UI
- NeedCard / NeedDetail に二重バー＋人数表示
- 未ログインは「気になる」のみ。ログイントースト導線
- ログイン済は「購入したい」「興味あり」（トグル可）

### 5) 受入れ基準
- 未ログイン"気になる"→200/summary増
- ログイン"興味あり/購入したい"→200/summary反映、二重登録不可（トグル）
- RLSで匿名は登録可・user行は漏洩なし
- e2e：未ログイン→200、ログイン→200、summary反映、重複抑止