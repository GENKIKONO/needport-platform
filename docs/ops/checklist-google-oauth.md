# Google OAuth本番検証チェックリスト

## 目的
本番環境でのGoogle OAuth設定を1回の手動検証で完全に確認し、以降の自動テストを安定稼働させるための準備チェックリスト。

## 前提条件
- [ ] Clerk Live環境にアクセス可能
- [ ] needport.jp 本番環境にアクセス可能  
- [ ] テスト用Googleアカウント利用可能
- [ ] 管理者権限でClerk設定変更可能

---

## Phase 1: Clerk Live環境設定確認

### 1.1 基本OAuth設定
- [ ] **Clerk Dashboard → Live環境 → Authentication → Social Connections**
- [ ] Google OAuth プロバイダーが「有効」になっている
- [ ] Client ID が設定されている（env.CLERKの値と一致）
- [ ] Client Secret が設定されている（env.CLERKの値と一致）
- [ ] 承認済みリダイレクトURI に `https://needport.jp` が含まれている

### 1.2 ドメイン・環境設定
- [ ] **Settings → General → Domains** で `needport.jp` が登録済み
- [ ] **Settings → Environment Variables** で本番用キーが設定済み
- [ ] Development/Test環境の設定が Live に混入していない

### 1.3 セキュリティ設定
- [ ] **Security → Attack Protection** が適切に設定
- [ ] **Security → Multi-factor** の設定確認
- [ ] **Security → Session** のタイムアウト設定確認

---

## Phase 2: Google Cloud Console設定確認

### 2.1 OAuth同意画面
- [ ] **Google Cloud Console → APIs & Services → OAuth同意画面**
- [ ] アプリ名: "NeedPort" で設定済み
- [ ] ユーザーサポートメール: 運営メールアドレス設定済み
- [ ] 承認済みドメイン: `needport.jp` 追加済み
- [ ] 本番公開状態（Testing状態でない）

### 2.2 認証情報
- [ ] **認証情報 → OAuth 2.0 クライアントID**
- [ ] 承認済みのリダイレクトURI:
  - [ ] `https://clerk.needport.jp/v1/oauth_callback`
  - [ ] `https://accounts.clerk.dev/oauth_callback` 
  - [ ] その他Clerkが要求するURI
- [ ] 承認済みJavaScript生成元: `https://needport.jp`

---

## Phase 3: 本番環境手動テスト

### 3.1 未ログイン状態でのアクセス
- [ ] `https://needport.jp` にアクセス
- [ ] ヘッダーに「ログイン」ボタンが表示される
- [ ] 「ログイン」クリック → `/sign-in` にリダイレクト
- [ ] Clerk SignIn UIが正常にレンダリング

### 3.2 Google OAuthフロー
- [ ] "Continue with Google" ボタンが表示される
- [ ] ボタンクリック → Google OAuth画面にリダイレクト
- [ ] テストアカウントでログイン
- [ ] 権限同意画面が表示される（初回のみ）
- [ ] 同意後、needport.jp にリダイレクト

### 3.3 認証後状態確認
- [ ] ログイン後、ヘッダーが「マイページ」表示に変わる
- [ ] `/me` ページが正常に表示される
- [ ] プロフィール情報が自動作成される
- [ ] ログアウト機能が正常動作する

### 3.4 ページリロード耐性
- [ ] 認証状態でページリロード → ログイン状態維持
- [ ] ブラウザ再起動後も認証状態維持（セッション期限内）
- [ ] 異なるタブで同時ログイン状態確認

---

## Phase 4: エラーハンドリング確認

### 4.1 意図的エラー作成
- [ ] Clerk Live環境のGoogle設定を一時的に無効化
- [ ] needport.jp でログインを試行
- [ ] 適切なエラーメッセージが表示される
- [ ] ユーザーが困らない導線になっている
- [ ] 設定を元に戻して動作復旧確認

### 4.2 境界値テスト
- [ ] 非常に長いGoogle表示名でのログイン
- [ ] 特殊文字を含むメールアドレスでのログイン
- [ ] 既存アカウントと同じメールでのログイン

---

## Phase 5: パフォーマンス・UX確認

### 5.1 応答時間
- [ ] Google OAuthリダイレクトが3秒以内
- [ ] ログイン完了からマイページ表示まで3秒以内
- [ ] 初回プロフィール作成が5秒以内

### 5.2 モバイル対応
- [ ] スマートフォンでGoogle OAuthが正常動作
- [ ] タブレットでGoogle OAuthが正常動作
- [ ] レスポンシブUIが適切に機能

---

## Phase 6: 最終確認

### 6.1 設定ドキュメント更新
- [ ] 本チェックリストに従い、設定値を環境構築ドキュメントに反映
- [ ] 緊急時の設定リセット手順を作成
- [ ] 定期的な設定確認スケジュール策定

### 6.2 自動テスト準備
- [ ] E2E用のテストアカウント Google OAuth で作成
- [ ] 環境変数 `CLERK_TEST_EMAIL`, `CLERK_TEST_PASSWORD` 設定
- [ ] `npm run test:golden` で E2E テストが成功
- [ ] CI環境での自動テスト動作確認

---

## チェックリスト完了確認

### 完了条件
- [ ] **Phase 1-6のすべてのチェック項目が完了**
- [ ] **手動テストでエラーが一切発生しない**
- [ ] **E2Eテストが5回連続で成功する**
- [ ] **本番環境でのGoogle OAuth設定が完全に安定**

### 完了後の作業
- [ ] 本チェックリスト実行結果をドキュメント化
- [ ] 運営チームに完了報告
- [ ] 定期的な設定確認（月1回）をカレンダー登録
- [ ] インシデント発生時の対応フローを準備

---

## 緊急時対応

### 設定が消失した場合
1. 本チェックリストに従い、すべての設定を再構築
2. Clerk サポートに連絡（Live環境の設定復旧依頼）
3. Google Cloud Console で OAuth設定を再確認
4. 本番環境での動作確認を再実行

### 参考リンク
- [Clerk Documentation - Google OAuth](https://clerk.com/docs/authentication/social-connections/google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [needport.jp 本番環境](https://needport.jp/)

---

**最終更新:** 2025-09-15  
**次回確認予定:** 2025-10-15  
**責任者:** 運営チーム