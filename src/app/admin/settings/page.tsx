"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

type FeatureFlags = {
  userEditEnabled: boolean;
  userDeleteEnabled: boolean;
  demoGuardEnabled: boolean;
  sampleVisible: boolean;
};

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function loadFlags() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/flags", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setFlags(data);
      }
    } catch (error) {
      console.error("Failed to load flags:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveFlags(updates: Partial<FeatureFlags>) {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      
      if (res.ok) {
        const data = await res.json();
        setFlags(data);
        toast("保存しました", "success");
      } else {
        toast("保存に失敗しました", "error");
      }
    } catch (error) {
      toast("保存に失敗しました", "error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { loadFlags(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <div className="text-sm text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">機能フラグ</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">ユーザー編集を許可</div>
              <div className="text-sm text-gray-500">マイページでニーズの編集を許可する</div>
            </div>
            <button
              onClick={() => saveFlags({ userEditEnabled: !flags?.userEditEnabled })}
              disabled={saving}
              className={`px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 ${
                flags?.userEditEnabled 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {flags?.userEditEnabled ? "有効" : "無効"}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">ユーザー削除を許可</div>
              <div className="text-sm text-gray-500">マイページでニーズの削除を許可する</div>
            </div>
            <button
              onClick={() => saveFlags({ userDeleteEnabled: !flags?.userDeleteEnabled })}
              disabled={saving}
              className={`px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 ${
                flags?.userDeleteEnabled 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {flags?.userDeleteEnabled ? "有効" : "無効"}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">デモガードを有効にする</div>
              <div className="text-sm text-gray-500">デモモードで一部機能を制限する</div>
            </div>
            <button
              onClick={() => saveFlags({ demoGuardEnabled: !flags?.demoGuardEnabled })}
              disabled={saving}
              className={`px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 ${
                flags?.demoGuardEnabled 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {flags?.demoGuardEnabled ? "有効" : "無効"}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">サンプル案件を公開側に表示</div>
              <div className="text-sm text-gray-500">サンプル案件を一般ユーザーに表示する</div>
            </div>
            <button
              onClick={() => saveFlags({ sampleVisible: !flags?.sampleVisible })}
              disabled={saving}
              className={`px-4 py-2 rounded hover:opacity-80 disabled:opacity-50 ${
                flags?.sampleVisible 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {flags?.sampleVisible ? "有効" : "無効"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">システム設定</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">自動承認</div>
              <div className="text-sm text-gray-500">一定条件を満たしたニーズを自動承認する</div>
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              無効
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">専門家チェック</div>
              <div className="text-sm text-gray-500">高額案件に専門家チェックを必須にする</div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              有効
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">エスクロー自動化</div>
              <div className="text-sm text-gray-500">承認時に自動でエスクローを設定する</div>
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              無効
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">承認待ち通知</div>
              <div className="text-sm text-gray-500">新しい承認待ち案件がある時に通知する</div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              有効
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">支払い保留通知</div>
              <div className="text-sm text-gray-500">支払い保留案件がある時に通知する</div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              有効
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
