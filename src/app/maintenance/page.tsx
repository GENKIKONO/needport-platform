"use client";

import { useState } from "react";
import Icon from '@/components/Icon';

export default function MaintenancePage() {
  const [showAdminSection, setShowAdminSection] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAdminAccess = () => {
    const expectedPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "1234"; // In production, this should be server-side
    
    if (adminPin === expectedPin) {
      // Set bypass cookie
      document.cookie = "maint-ok=1; path=/; max-age=3600"; // 1 hour
      setMessage({
        type: "success",
        text: "管理者アクセスが有効になりました。ページを再読み込みしてください。"
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      setMessage({
        type: "error",
        text: "管理者PINが正しくありません。"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-8 text-center">
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <Icon name="settings" className="size-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">メンテナンス中</h1>
          <p className="text-gray-400 mb-6">
            現在、システムメンテナンスを実施しています。<br />
            ご不便をおかけしますが、しばらくお待ちください。
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">予想復旧時間</h2>
          <p className="text-gray-300">
            2024年12月23日 15:00頃
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-300 mb-2">メンテナンス内容</h3>
          <ul className="text-sm text-blue-200 space-y-1 text-left">
            <li>• システムアップデート</li>
            <li>• データベース最適化</li>
            <li>• セキュリティ強化</li>
          </ul>
        </div>

        {/* Admin Section */}
        <div className="border-t border-gray-700 pt-6">
          <button
            onClick={() => setShowAdminSection(!showAdminSection)}
            className="text-sm text-gray-400 hover:text-gray-300 underline"
          >
            管理者はこちら
          </button>
          
          {showAdminSection && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">管理者バイパス</h3>
              <p className="text-sm text-gray-400 mb-4">
                管理者PINを入力してメンテナンスモードをバイパスできます。
              </p>
              
              <div className="space-y-3">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="管理者PIN"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                />
                
                <button
                  onClick={handleAdminAccess}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white font-medium"
                >
                  アクセス許可
                </button>
              </div>
              
              {message && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  message.type === "success" 
                    ? "bg-green-900/20 border border-green-500/40 text-green-300"
                    : "bg-red-900/20 border border-red-500/40 text-red-300"
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>お問い合わせ: support@needport.jp</p>
        </div>
      </div>
    </div>
  );
}
