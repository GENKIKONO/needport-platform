"use client";
import { useState, useEffect } from "react";

interface Need {
  id: string;
  title: string;
  category: string;
  region: string;
  status: string;
  created_at: string;
}

export default function DataManagement() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      const response = await fetch('/api/admin/data/needs');
      if (response.ok) {
        const data = await response.json();
        setNeeds(data.needs || []);
      }
    } catch (error) {
      console.error('Error fetching needs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('本当にすべてのダミーデータを削除しますか？この操作は元に戻せません。')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/data/clear', {
        method: 'POST'
      });
      
      if (response.ok) {
        setMessage('ダミーデータを削除しました');
        await fetchNeeds();
      } else {
        setMessage('データの削除に失敗しました');
      }
    } catch (error) {
      setMessage('エラーが発生しました');
    }
  };

  const generateSampleData = async () => {
    try {
      const response = await fetch('/api/admin/data/generate', {
        method: 'POST'
      });
      
      if (response.ok) {
        setMessage('サンプルデータを生成しました');
        await fetchNeeds();
      } else {
        setMessage('データの生成に失敗しました');
      }
    } catch (error) {
      setMessage('エラーが発生しました');
    }
  };

  const deleteNeed = async (id: string) => {
    if (!confirm('このニーズを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/data/needs/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessage('ニーズを削除しました');
        await fetchNeeds();
      } else {
        setMessage('削除に失敗しました');
      }
    } catch (error) {
      setMessage('エラーが発生しました');
    }
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">データ管理</h2>
        
        {message && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded">
            {message}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button 
            onClick={generateSampleData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            サンプルデータ生成
          </button>
          <button 
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            全データ削除
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">投稿されたニーズ ({needs.length}件)</h3>
          
          {needs.length === 0 ? (
            <p className="text-gray-500">データがありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">タイトル</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">カテゴリ</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">地域</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">ステータス</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">作成日</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {needs.map((need) => (
                    <tr key={need.id}>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-mono">{need.id}</td>
                      <td className="border border-gray-300 px-4 py-2">{need.title}</td>
                      <td className="border border-gray-300 px-4 py-2">{need.category}</td>
                      <td className="border border-gray-300 px-4 py-2">{need.region}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          need.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {need.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {new Date(need.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button 
                          onClick={() => deleteNeed(need.id)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}