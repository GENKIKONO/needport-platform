export const dynamic = "force-dynamic";

import { getAllSettings } from "@/lib/server/settings";
import AdminBar from "@/components/admin/AdminBar";
import SettingsForm from "@/components/admin/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      
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
