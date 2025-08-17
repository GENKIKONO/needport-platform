"use client";
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function MePage() {
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // ダミーデータ（実際はAPIから取得）
  const myNeeds = [
    { id: 'need-001', title: '地下室がある家を建てたい', interest_count: 0 },
    { id: 'need-002', title: '手作り家具のワークショップ', interest_count: 2 },
  ];

  const handleDelete = async (needId: string, interestCount: number) => {
    if (interestCount > 0) {
      alert('すでに賛同があるため削除できません');
      return;
    }
    
    if (!confirm('この投稿を削除しますか？（賛同0件のみ削除可能）')) return;
    
    setDeleting(needId);
    try {
      const r = await fetch(`/api/needs/${needId}/delete-if-clear`, { method: 'DELETE' });
      if (r.status === 204) {
        // 楽観更新: listから除去（実際は再取得）
        alert('削除しました');
      } else if (r.status === 409) {
        alert('すでに賛同があるため削除できません');
      } else {
        alert('削除エラー');
      }
    } catch (error) {
      alert('削除エラー');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="section space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      
      {/* Profile Card */}
      <div className="np-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            デ
          </div>
          <div>
            <h2 className="text-lg font-semibold">デモユーザー</h2>
            <p className="text-sm text-gray-600">東京都渋谷区</p>
            <p className="text-xs text-gray-500">参加日: 2025/8/17</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="np-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">2</div>
          <div className="text-sm text-gray-600">投稿</div>
        </div>
        <div className="np-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">興味表明</div>
        </div>
        <div className="np-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-gray-600">マッチング</div>
        </div>
      </div>

      {/* My Posts */}
      <div className="np-card p-6">
        <h3 className="font-semibold mb-4">私の投稿</h3>
        <div className="space-y-3">
          {myNeeds.map(need => (
            <div key={need.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">{need.title}</h4>
                <p className="text-sm text-gray-600">賛同: {need.interest_count}件</p>
              </div>
              <button
                disabled={need.interest_count > 0 || deleting === need.id}
                onClick={() => handleDelete(need.id, need.interest_count)}
                className="btn btn-ghost disabled:opacity-50 text-sm"
              >
                {deleting === need.id ? '削除中...' : '削除'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="np-card p-6">
        <h3 className="font-semibold mb-4">クイックアクション</h3>
        <div className="grid gap-3">
          <a href="/post" className="btn btn-primary">新しいニーズを投稿</a>
          <a href="/needs" className="btn btn-ghost">ニーズを探す</a>
        </div>
      </div>
    </main>
  );
}
