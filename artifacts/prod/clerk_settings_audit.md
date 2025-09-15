# Clerk(Live) 設定監査結果

**実行日時:** 2025-09-15T05:00  
**対象:** Live Instance (ins_31MOISvBo7YyODmSyNw8x5RhOx5)

## 🚨 重大な問題発見

### Live Instance Status
- **ID:** `ins_31MOISvBo7YyODmSyNw8x5RhOx5`
- **Environment:** `production` ✅
- **Allowed Origins:** `null` ⚠️

### OAuth Applications (Google設定)
- **現状:** `{"data":[],"total_count":0}` ❌
- **問題:** **GoogleのOAuth設定が一切存在しない**

## 📊 設定監査結果

| 項目 | 現状 | 期待値 | ステータス |
|------|------|--------|-----------|
| Instance Type | production | production | ✅ |
| Allowed Origins | null | needport.jp | ❌ |
| OAuth Apps (Google) | 0件 | 1件（Google） | ❌ |
| Domains | 未確認 | needport.jp | 🔄 |

## 🔧 **根本原因判明**

**Test→Live切替でGoogleログインが動かない理由:**
1. **Live環境にGoogleのOAuth設定が存在しない**
2. **Allowed Originsが設定されていない**

## 🚀 修正手順（Clerk Dashboard手動設定必要）

### 1. Clerk Dashboard アクセス
- https://dashboard.clerk.com にアクセス
- Live環境を選択

### 2. OAuth設定追加
- **Social connections** → **Google** を追加
- **Client ID/Secret** を設定
- **Used for sign-in** を有効化

### 3. Domain設定
- **Domains** → `needport.jp` を追加・有効化

### 4. Allowed Origins設定
- **Settings** → **Allowed Origins** に以下を追加:
  - `https://needport.jp`
  - `https://needport.jp/*`

### 5. Redirect URLs設定
- **Sign-in URL:** `/sign-in`
- **Sign-up URL:** `/sign-up`
- **Allowed redirect URLs:**
  - `https://needport.jp/sign-in*`
  - `https://needport.jp/sign-up*`
  - `https://needport.jp/sso-callback*`