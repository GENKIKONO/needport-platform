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

interface FeatureFlags {
  stripe: boolean;
  pwa: boolean;
  demo: boolean;
  rls: boolean;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState<FeatureFlags>({
    stripe: false,
    pwa: false,
    demo: false,
    rls: false,
  });
  const [needData, setNeedData] = useState({
    title: "",
    summary: "",
    min_people: "",
    price_amount: "",
  });

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        
        // Extract feature flags from health check
        const flagsCheck = data.checks.find((check: HealthCheck) => check.name === "Feature Flags");
        if (flagsCheck?.details) {
          setFlags(flagsCheck.details);
        }
      }
    } catch (error) {
      console.error("Failed to fetch health status:", error);
    }
  };

  const updateFeatureFlag = async (flag: keyof FeatureFlags, value: boolean) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `feature_${flag}`,
          value: value.toString(),
        }),
      });
      
      if (response.ok) {
        setFlags(prev => ({ ...prev, [flag]: value }));
        await fetchHealthStatus(); // Refresh health status
      }
    } catch (error) {
      console.error("Failed to update feature flag:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialNeed = async () => {
    if (!needData.title.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: needData.title.trim(),
          summary: needData.summary.trim(),
          min_people: needData.min_people ? parseInt(needData.min_people) : undefined,
          price_amount: needData.price_amount ? parseInt(needData.price_amount) : undefined,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert("初回ニーズが作成されました！");
        window.location.href = `/admin/needs/${result.id}/offers`;
      } else {
        const error = await response.json();
        alert(`作成に失敗しました: ${error.error}`);
      }
    } catch (error) {
      alert("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok": return "bg-green-600/20 border-green-500/40 text-green-300";
      case "warning": return "bg-yellow-600/20 border-yellow-500/40 text-yellow-300";
      case "error": return "bg-red-600/20 border-red-500/40 text-red-300";
      default: return "bg-gray-600/20 border-gray-500/40 text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok": return "✓";
      case "warning": return "⚠";
      case "error": return "✗";
      default: return "?";
    }
  };

  return (
    <div className="space-y-6">
      <AdminBar title="初期セットアップ" />
      
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">初期セットアップウィザード</h1>
          <p className="text-gray-400">
            NeedPortの初期設定を行います。3つのステップで完了します。
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? "bg-emerald-600 text-white" 
                    : "bg-gray-600 text-gray-300"
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? "bg-emerald-600" : "bg-gray-600"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>環境チェック</span>
            <span>機能設定</span>
            <span>初回ニーズ</span>
          </div>
        </div>

        {/* Step 1: Environment Check */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">ステップ 1: 環境チェック</h2>
              <p className="text-gray-400 mb-6">
                システムの各コンポーネントが正常に動作しているか確認します。
              </p>
            </div>

            {health ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${getStatusColor(health.status)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(health.status)}</span>
                    <h3 className="font-medium">
                      システム状態: {health.status === "ok" ? "正常" : health.status === "warning" ? "警告" : "エラー"}
                    </h3>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {health.checks.map((check) => (
                    <div key={check.name} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{check.name}</h4>
                        <span className="text-lg">{getStatusIcon(check.status)}</span>
                      </div>
                      <p className="text-sm opacity-80">{check.message}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={fetchHealthStatus}
                    disabled={loading}
                    className="rounded-lg border border-blue-500/40 bg-blue-600/20 px-4 py-2 text-sm text-blue-200 hover:bg-blue-600/30 disabled:opacity-50"
                  >
                    {loading ? "確認中..." : "再確認"}
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={health.status === "error"}
                    className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>環境チェックを実行中...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Feature Flags */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">ステップ 2: 機能設定</h2>
              <p className="text-gray-400 mb-6">
                必要な機能を有効化します。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(flags).map(([key, value]) => (
                <div key={key} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{key}</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateFeatureFlag(key as keyof FeatureFlags, e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">
                    {key === "stripe" && "決済機能を有効化"}
                    {key === "pwa" && "PWA機能を有効化"}
                    {key === "demo" && "デモモードを有効化"}
                    {key === "rls" && "Row Level Securityを有効化"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="rounded-lg border border-gray-500/40 bg-gray-600/20 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/30"
              >
                戻る
              </button>
              
              <button
                onClick={() => setCurrentStep(3)}
                className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Initial Need */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">ステップ 3: 初回ニーズ作成</h2>
              <p className="text-gray-400 mb-6">
                最初の募集案件を作成します。
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">タイトル *</label>
                <input
                  type="text"
                  value={needData.title}
                  onChange={(e) => setNeedData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="募集案件のタイトル"
                  className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">概要</label>
                <textarea
                  value={needData.summary}
                  onChange={(e) => setNeedData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="募集案件の詳細説明"
                  rows={4}
                  className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">最低人数</label>
                  <input
                    type="number"
                    value={needData.min_people}
                    onChange={(e) => setNeedData(prev => ({ ...prev, min_people: e.target.value }))}
                    placeholder="例: 10"
                    className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">予算（円）</label>
                  <input
                    type="number"
                    value={needData.price_amount}
                    onChange={(e) => setNeedData(prev => ({ ...prev, price_amount: e.target.value }))}
                    placeholder="例: 500000"
                    className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded-lg border border-gray-500/40 bg-gray-600/20 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/30"
              >
                戻る
              </button>
              
              <button
                onClick={createInitialNeed}
                disabled={loading || !needData.title.trim()}
                className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
              >
                {loading ? "作成中..." : "ニーズを作成"}
              </button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        <div className="mt-8 p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-lg">
          <h3 className="font-medium text-emerald-300 mb-2">セットアップ完了後</h3>
          <ul className="text-sm text-emerald-200 space-y-1">
            <li>• 作成したニーズにオファーを追加できます</li>
            <li>• 管理画面から各種設定を変更できます</li>
            <li>• システムヘルスページで状態を監視できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
