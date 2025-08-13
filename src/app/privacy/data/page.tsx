"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyDataPage() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Get client ID from cookie
    const getClientId = () => {
      const cookies = document.cookie.split(";");
      const npClientCookie = cookies.find(cookie => cookie.trim().startsWith("np_client="));
      if (npClientCookie) {
        const clientId = npClientCookie.split("=")[1];
        setClientId(clientId);
      }
    };

    getClientId();
  }, []);

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/privacy/export");
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `needport-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "データのエクスポートが完了しました。ファイルがダウンロードされます。"
      });
    } catch (error) {
      console.error("Export error:", error);
      setMessage({
        type: "error",
        text: "データのエクスポートに失敗しました。"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "この操作は取り消すことができません。\n\n" +
      "あなたのデータは完全に匿名化され、このブラウザでの識別はできなくなります。\n\n" +
      "本当に削除を実行しますか？"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/privacy/delete", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Deletion failed");
      }

      const result = await response.json();

      setMessage({
        type: "success",
        text: `データの削除が完了しました。${result.total_anonymized}件のレコードが匿名化されました。`
      });

      // Clear client ID from state
      setClientId(null);

      // Redirect to home after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);

    } catch (error) {
      console.error("Deletion error:", error);
      setMessage({
        type: "error",
        text: "データの削除に失敗しました。"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">プライバシーデータ管理</h1>
          <p className="text-gray-400">
            あなたのデータの確認、エクスポート、削除を行うことができます。
          </p>
        </div>

        <div className="space-y-6">
          {/* Client ID Display */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">あなたの識別ID</h2>
            {clientId ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">このIDであなたのデータが管理されています：</p>
                <code className="block bg-gray-700 px-3 py-2 rounded text-sm font-mono break-all">
                  {clientId}
                </code>
              </div>
            ) : (
              <p className="text-gray-400">識別IDが見つかりません。</p>
            )}
          </div>

          {/* Data Export */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">データのエクスポート</h2>
            <p className="text-gray-400 mb-4">
              あなたに関連するすべてのデータをJSON形式でダウンロードできます。
            </p>
            <button
              onClick={handleExport}
              disabled={loading || !clientId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium"
            >
              {loading ? "エクスポート中..." : "データをエクスポート"}
            </button>
          </div>

          {/* Data Deletion */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">データの削除</h2>
            <div className="space-y-4">
              <p className="text-gray-400">
                あなたのデータを完全に匿名化します。この操作は取り消すことができません。
              </p>
              <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-4">
                <h3 className="font-medium text-red-300 mb-2">⚠️ 注意事項</h3>
                <ul className="text-sm text-red-200 space-y-1">
                  <li>• この操作は取り消すことができません</li>
                  <li>• すべての個人データが匿名化されます</li>
                  <li>• このブラウザでの識別はできなくなります</li>
                  <li>• システムの統計データは保持されます</li>
                </ul>
              </div>
              <button
                onClick={handleDelete}
                disabled={loading || !clientId}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium"
              >
                {loading ? "削除中..." : "データを削除"}
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`rounded-lg p-4 ${
              message.type === "success" 
                ? "bg-green-900/20 border border-green-500/40 text-green-300"
                : "bg-red-900/20 border border-red-500/40 text-red-300"
            }`}>
              {message.text}
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg p-6">
            <h3 className="font-medium text-blue-300 mb-3">データについて</h3>
            <div className="text-sm text-blue-200 space-y-2">
              <p>当サイトでは以下のデータを収集・管理しています：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ページビュー履歴（訪問したページ、時間）</li>
                <li>参加予約情報（ニーズへの参加申し込み）</li>
                <li>同意記録（利用規約への同意履歴）</li>
                <li>エラーログ（技術的な問題の記録）</li>
              </ul>
              <p className="mt-3">
                これらのデータはサービスの改善とユーザー体験の向上のために使用されます。
                個人を特定する情報は含まれていません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
