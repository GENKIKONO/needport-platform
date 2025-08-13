"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("設定を保存しました");
        // Reload page to reflect changes
        window.location.reload();
      } else {
        toast.error(data.message || "設定の保存に失敗しました");
      }
    } catch (error) {
      toast.error("設定の保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          サイトURL
        </label>
        <input
          type="url"
          value={settings.site_url || ""}
          onChange={(e) => handleChange("site_url", e.target.value)}
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
          placeholder="https://example.com"
        />
        <p className="text-xs text-gray-400 mt-1">
          フィードやOG画像のベースURLとして使用されます
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.notifications_enabled === "true"}
            onChange={(e) => handleChange("notifications_enabled", e.target.checked ? "true" : "false")}
            className="rounded border-white/10 bg-zinc-800"
          />
          <span className="text-sm font-medium">通知機能を有効にする</span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          メール通知システムの有効/無効を切り替えます
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          通知送信先（カンマ区切り）
        </label>
        <input
          type="text"
          value={settings.notify_to || ""}
          onChange={(e) => handleChange("notify_to", e.target.value)}
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
          placeholder="admin@example.com, staff@example.com"
        />
        <p className="text-xs text-gray-400 mt-1">
          管理者通知の送信先メールアドレス
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          BCC（カンマ区切り）
        </label>
        <input
          type="text"
          value={settings.notify_bcc || ""}
          onChange={(e) => handleChange("notify_bcc", e.target.value)}
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
          placeholder="archive@example.com"
        />
        <p className="text-xs text-gray-400 mt-1">
          通知のBCC送信先（任意）
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.email_mask_pii === "true"}
            onChange={(e) => handleChange("email_mask_pii", e.target.checked ? "true" : "false")}
            className="rounded border-white/10 bg-zinc-800"
          />
          <span className="text-sm font-medium">メールでPIIをマスクする</span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          メール通知で個人情報を部分的に隠します
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.pwa_enabled === "true"}
            onChange={(e) => handleChange("pwa_enabled", e.target.checked ? "true" : "false")}
            className="rounded border-white/10 bg-zinc-800"
          />
          <span className="text-sm font-medium">PWA機能を有効にする</span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          プログレッシブウェブアプリ機能の有効/無効を切り替えます
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.rls_enforce === "true"}
            onChange={(e) => handleChange("rls_enforce", e.target.checked ? "true" : "false")}
            className="rounded border-white/10 bg-zinc-800"
          />
          <span className="text-sm font-medium">RLS（行レベルセキュリティ）を強制する</span>
        </label>
        <p className="text-xs text-gray-400 mt-1">
          データベースの行レベルセキュリティを強制します（本番環境推奨）
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Stripe有効化
        </label>
        <input
          type="text"
          value={settings.stripe_enabled || ""}
          disabled
          className="w-full rounded-lg bg-zinc-700 px-3 py-2 outline-none ring-1 ring-white/10 text-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">
          環境変数で設定されます（読み取り専用）
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
        >
          {loading ? "保存中..." : "設定を保存"}
        </button>
      </div>
    </form>
  );
}
