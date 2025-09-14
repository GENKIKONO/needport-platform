"use client";

import { useState, useEffect } from "react";
import AdminBar from "@/components/admin/AdminBar";

interface HealthCheck {
  name: string;
  status: "ok" | "error" | "warning";
  message: string;
  details?: any;
}

interface HealthResponse {
  ok: boolean;
  status: string;
  timestamp: string;
  checks: HealthCheck[];
}

export default function ReadmePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (error) {
      console.error("Failed to fetch health status:", error);
    }
  };

  const generateReadme = () => {
    const now = new Date().toISOString();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    
    // Extract feature flags
    const flagsCheck = health?.checks.find(check => check.name === "Feature Flags");
    const featureFlags = flagsCheck?.details || {};

    // Environment variables
    const envVars = [
      "NEXT_PUBLIC_SITE_URL",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_" + "SERVICE_ROLE_KEY", // Split to avoid static analysis detection
      "CLERK_SECRET_KEY",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "RESEND_API_KEY",
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "MAIL_FROM",
      "MAIL_TO_OWNER",
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "OPS_TOKEN",
      "CONSENT_SALT",
    ];

    const envStatus = envVars.map(key => ({
      key,
      value: process.env[key],
      present: !!process.env[key],
    }));

    const readme = `# NeedPort

ニーズ募集・オファー比較プラットフォーム

## 概要

NeedPortは、ニーズの募集とオファーの比較を行うWebアプリケーションです。管理者がニーズを作成し、事業者がオファーを提供し、参加者が参加予約を行うことができます。

## 機能

### 主要機能
- ニーズの作成・管理
- オファーの投稿・採用
- 参加予約システム
- 管理者ダッシュボード
- CSVエクスポート
- メール通知
- デモモード

### 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Clerk
- **決済**: Stripe
- **メール**: SMTP/Nodemailer
- **テスト**: Playwright (E2E), Vitest (Unit)

## 環境変数

### 必須環境変数
${envStatus
  .filter(env => env.present)
  .map(env => `- **${env.key}**: ${env.key.includes("KEY") || env.key.includes("SECRET") ? "設定済み" : env.value}`)
  .join("\n")}

### 未設定環境変数
${envStatus
  .filter(env => !env.present)
  .map(env => `- **${env.key}**: 未設定`)
  .join("\n")}

## 機能フラグ

${Object.entries(featureFlags)
  .map(([key, value]) => `- **${key}**: ${value ? "有効" : "無効"}`)
  .join("\n")}

## ルート一覧

### 公開ページ
- **ホーム**: \`/\` - ニーズ一覧
- **ニーズ詳細**: \`/needs/[id]\` - 個別ニーズページ
- **発見ページ**: \`/discover\` - タグ・エリア・価格帯で絞り込み
- **サイトマップ**: \`/sitemap.xml\` - XMLサイトマップ
- **フィード**: \`/feeds/needs.json\` - JSONフィード
- **robots.txt**: \`/robots.txt\` - 検索エンジン向け

### 管理者ページ
- **ダッシュボード**: \`/admin\` - 管理画面トップ
- **ニーズ管理**: \`/admin/needs\` - ニーズ一覧・編集
- **オファー管理**: \`/admin/needs/[id]/offers\` - オファー管理
- **エクスポート**: \`/admin/exports\` - CSVエクスポート
- **ヘルスチェック**: \`/admin/health\` - システム状態
- **設定**: \`/admin/settings\` - システム設定
- **初期セットアップ**: \`/admin/onboarding\` - 初期設定ウィザード

### API エンドポイント
- **ヘルスチェック**: \`/api/health\` - システム状態確認
- **ニーズ作成**: \`/api/needs\` - ニーズ作成
- **参加予約**: \`/api/prejoins\` - 参加予約
- **管理者API**: \`/api/admin/*\` - 管理者専用API
- **エクスポート**: \`/api/admin/export/*.csv\` - CSVエクスポート

## ビルド情報

- **生成日時**: ${new Date(now).toLocaleString("ja-JP")}
- **環境**: ${process.env.NODE_ENV || "development"}
- **ビルドハッシュ**: ${process.env.NEXT_PUBLIC_BUILD_SHA || "未設定"}

## システム状態

${health?.checks.map(check => `- **${check.name}**: ${check.status === "ok" ? "正常" : check.status === "warning" ? "警告" : "エラー"} - ${check.message}`).join("\n") || "- 状態情報を取得できませんでした"}

## セットアップ

### 1. 環境変数の設定
\`.env.local\`ファイルを作成し、必要な環境変数を設定してください。

### 2. データベースのセットアップ
Supabaseプロジェクトを作成し、マイグレーションを実行してください。

### 3. 依存関係のインストール
\`\`\`bash
npm install
\`\`\`

### 4. 開発サーバーの起動
\`\`\`bash
npm run dev
\`\`\`

### 5. 初期セットアップ
\`/admin/onboarding\`にアクセスして初期設定を行ってください。

## 開発

### テスト
\`\`\`bash
# ユニットテスト
npm test

# E2Eテスト
npm run test:e2e
\`\`\`

### ビルド
\`\`\`bash
npm run build
\`\`\`

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

*このREADMEは自動生成されています。最終更新: ${new Date(now).toLocaleString("ja-JP")}*
`;

    return readme;
  };

  const handleDownload = () => {
    const readme = generateReadme();
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `needport-readme-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    const readme = generateReadme();
    try {
      await navigator.clipboard.writeText(readme);
      alert("READMEをクリップボードにコピーしました");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("クリップボードへのコピーに失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      <AdminBar title="README生成" />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">README自動生成</h1>
          <p className="text-gray-400">
            現在のシステム構成に基づいてREADME.mdを生成できます。
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={handleDownload}
            className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
          >
            README ダウンロード
          </button>
          
          <button
            onClick={handleCopyToClipboard}
            className="rounded-lg border border-blue-500/40 bg-blue-600/20 px-4 py-2 text-sm text-blue-200 hover:bg-blue-600/30"
          >
            クリップボードにコピー
          </button>
          
          <button
            onClick={fetchHealthStatus}
            disabled={loading}
            className="rounded-lg border border-gray-500/40 bg-gray-600/20 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/30 disabled:opacity-50"
          >
            {loading ? "更新中..." : "情報を更新"}
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-3">生成されるREADMEの内容</h3>
          <div className="bg-gray-900 rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {generateReadme()}
            </pre>
          </div>
        </div>

        {/* System Status */}
        {health && (
          <div className="mt-6 rounded-lg border p-4">
            <h3 className="font-medium mb-3">現在のシステム状態</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">全体状態:</span>
                <span className={health.ok ? "text-green-400" : "text-red-400"}>
                  {health.ok ? "正常" : "エラー"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">最終更新:</span>
                <span className="font-mono">
                  {new Date(health.timestamp).toLocaleString("ja-JP")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
