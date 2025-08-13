'use client';

import { useState } from 'react';
import AdminBar from '@/components/admin/AdminBar';

interface ImportResult {
  inserted: number;
  skipped: number;
  errors: string[];
  createdIds: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('CSVファイルを選択してください');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/needs/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        alert(data.error || 'インポートに失敗しました');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('インポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminBar title="ニーズ一括登録" />
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">CSVインポート</h1>
        
        <div className="max-w-2xl space-y-6">
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">CSVフォーマット</h3>
            <p className="text-sm text-gray-400 mb-3">
              以下のカラムを含むCSVファイルをアップロードしてください：
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• title: タイトル（必須）</li>
              <li>• summary: 概要（必須）</li>
              <li>• tags: タグ（カンマ区切り）</li>
              <li>• price: 価格</li>
              <li>• location: 場所</li>
              <li>• deadline: 締切日（YYYY-MM-DD）</li>
              <li>• status: ステータス（draft/pending/published）</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                CSVファイル
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'インポート中...' : 'インポート開始'}
            </button>
          </form>

          {result && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="font-medium mb-3">インポート結果</h3>
              <div className="space-y-2 text-sm">
                <div>登録成功: {result.inserted}件</div>
                <div>スキップ: {result.skipped}件</div>
                {result.errors.length > 0 && (
                  <div>
                    <div className="font-medium text-red-400 mb-2">エラー:</div>
                    <ul className="text-red-400 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.createdIds.length > 0 && (
                  <div>
                    <div className="font-medium mb-2">作成されたニーズ:</div>
                    <div className="space-y-1">
                      {result.createdIds.map((id) => (
                        <a
                          key={id}
                          href={`/admin/needs/${id}/offers`}
                          className="block text-emerald-400 hover:text-emerald-300 underline"
                        >
                          {id}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
