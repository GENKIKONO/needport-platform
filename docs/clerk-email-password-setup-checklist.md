# Clerk Email/Password設定チェックリスト

## 🎛️ Clerk Dashboard 設定手順

### **Step 1: Clerk Dashboard にアクセス**
1. [Clerk Dashboard](https://dashboard.clerk.com/) にログイン
2. 対象のアプリケーション（NeedPort）を選択

### **Step 2: User & Authentication 設定**

#### **2.1 Email, phone, username 設定**
**場所**: `User & Authentication` → `Email, phone, username`

**チェック項目**:
- [ ] **Email address**: `Required` または `Optional` に設定（`Off` になっていないか）
- [ ] **Password**: `Required` に設定（必須）
- [ ] **Email verification**: `Verification code` または `Verification link` に設定
- [ ] **Phone number**: `Off` または `Optional`（E2Eテストでは不要）
- [ ] **Username**: `Off` または `Optional`（E2Eテストでは不要）

**設定例**:
```
✅ Email address: Required
✅ Password: Required  
✅ Email verification: Verification code
❌ Phone number: Off
❌ Username: Off
```

#### **2.2 Social connections 設定**
**場所**: `User & Authentication` → `Social connections`

**チェック項目**:
- [ ] **Google**: 有効でも可（E2Eテストには影響しない）
- [ ] **その他SNS**: 有効でも可
- [ ] **重要**: Email/Passwordログインが無効化されていないか確認

#### **2.3 Restrictions 設定**
**場所**: `User & Authentication` → `Restrictions`

**チェック項目**:
- [ ] **Allow sign-ups**: `Enabled`（テストアカウント作成用）
- [ ] **Restrict sign-ups to email domains**: 空白 または テストメールドメインを追加
- [ ] **Restrict sign-ups to invitations only**: `Disabled`

#### **2.4 Attack protection 設定**
**場所**: `User & Authentication` → `Attack protection`

**チェック項目**:
- [ ] **Bot protection**: `Disabled` または `Low`（E2Eテスト実行を妨げないため）
- [ ] **Rate limiting**: `Moderate` 以下（過度に厳しくない設定）

### **Step 3: Sessions 設定**
**場所**: `Sessions`

**チェック項目**:
- [ ] **Session token lifetime**: `8 hours` 以上（短すぎるとE2Eテスト中に期限切れ）
- [ ] **Inactivity timeout**: `30 minutes` 以上

## 🧪 テストユーザー事前確認方法

### **Method 1: ブラウザでの手動確認**

#### **1.1 サインイン画面確認**
```bash
1. https://needport.jp/sign-in にアクセス
2. 以下の要素が表示されるか確認:
   ✅ Email入力フィールド
   ✅ Password入力フィールド  
   ✅ "Sign in" ボタン
   ❌ "Email/Password login is disabled" 等のエラー
```

#### **1.2 テストアカウントでログイン試行**
```bash
1. Email: your-test@email.com
2. Password: YourTestPassword
3. 結果確認:
   ✅ ログイン成功 → /me や / にリダイレクト
   ❌ ログイン失敗 → エラーメッセージを確認
```

### **Method 2: 自動確認スクリプト**

以下のスクリプトを作成しました：

```bash
# 実行方法
node scripts/test-clerk-login.js
```

このスクリプトが：
- サインイン画面の要素チェック
- 実際のログイン試行（認証情報提供時）
- Clerk設定の問題を自動診断

### **Method 3: Curl での基本確認**

```bash
# サインイン画面の取得
curl -s https://needport.jp/sign-in | grep -i "email\|password\|sign"

# 期待される出力例:
# <input type="email" ...>
# <input type="password" ...>
# <button>Sign in</button>
```

## 🚨 よくある問題と対処法

### **問題 1: "Email address is disabled"**
**原因**: Email設定が `Off` になっている
**対処**: `Email, phone, username` → `Email address` を `Required` に変更

### **問題 2: "Password authentication is disabled"**
**原因**: Password設定が `Off` になっている  
**対処**: `Email, phone, username` → `Password` を `Required` に変更

### **問題 3: "Sign-ups are restricted"**
**原因**: サインアップが制限されている
**対処**: `Restrictions` → `Allow sign-ups` を `Enabled` に変更

### **問題 4: "Bot protection blocking"**
**原因**: Bot保護が厳しすぎる
**対処**: `Attack protection` → `Bot protection` を `Disabled` または `Low` に変更

### **問題 5: "Session expired quickly"**
**原因**: セッション設定が短すぎる
**対処**: `Sessions` → `Session token lifetime` を `8 hours` 以上に設定

## 📋 設定完了後の確認手順

### **1. 設定反映待ち**
```bash
# Clerk設定変更後、5-10分待つ
# CDN/キャッシュ更新のため
```

### **2. 動作確認**
```bash
# A. ブラウザで手動確認
open https://needport.jp/sign-in

# B. 自動確認スクリプト実行
node scripts/test-clerk-login.js

# C. E2Eテスト実行
export CLERK_TEST_EMAIL="your-test@email.com"
export CLERK_TEST_PASSWORD="YourTestPassword"
npm run monitor:prod:e2e
```

### **3. トラブルシューティング**
設定変更後も問題が続く場合：

```bash
# Clerk設定確認
node scripts/check-clerk-config.js

# ブラウザキャッシュクリア
# Chrome: Ctrl+Shift+R（強制リロード）

# 新しいシークレットウィンドウでテスト
```

## 🎯 最終チェックリスト

完了したらチェック：

- [ ] Clerk Dashboard設定完了
- [ ] ブラウザで手動ログイン成功
- [ ] 自動確認スクリプトで問題なし
- [ ] 環境変数設定済み
- [ ] E2Eテスト準備完了

**全て完了後**: `npm run monitor:prod:e2e` で本格テスト実行