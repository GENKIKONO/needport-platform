"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import type { SimpleNeedInputType } from '@/lib/validation/need';

export default function NewSimpleNeedPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [formData, setFormData] = useState<SimpleNeedInputType>({
    title: '',
    summary: '',
    body: '',
    area: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string; needId?: string } | null>(null);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="container-page py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-slate-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="container-page py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100/50">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-slate-800">ニーズの投稿</h1>
              <p className="text-slate-600">
                ニーズを投稿するにはログインが必要です。
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/sign-in"
                  className="px-6 py-3 bg-blue-500/90 text-white rounded-full hover:bg-blue-600/90 transition-all"
                >
                  ログイン
                </Link>
                <Link 
                  href="/needs"
                  className="px-6 py-3 border border-blue-100/60 text-slate-700 rounded-full hover:bg-blue-50/50 transition-all"
                >
                  ニーズ一覧へ戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (name: keyof SimpleNeedInputType, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setResult({ type: 'error', message: 'タイトルを入力してください' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/needs/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          summary: formData.summary?.trim() || undefined,
          body: formData.body?.trim() || undefined,
          area: formData.area?.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || '投稿に失敗しました');
      }

      setResult({ 
        type: 'success', 
        message: '投稿が完了しました！',
        needId: data.id 
      });

      // Reset form
      setFormData({ title: '', summary: '', body: '', area: '' });

      // Redirect after 2 seconds
      setTimeout(() => {
        // Use need detail page when available, fallback to needs list
        window.location.href = `/needs`;
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setResult({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '投稿に失敗しました' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100/50">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">新しいニーズを投稿</h1>
            <p className="text-slate-600">
              困りごとや「こうだったらいいな」を気軽に投稿してみてください。
            </p>
          </div>

          {result && (
            <div className={`mb-6 p-4 rounded-lg ${
              result.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p>{result.message}</p>
              {result.needId && (
                <p className="text-sm mt-1 text-green-600">
                  ID: {result.needId}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="例：家の掃除を手伝ってほしい"
                className="w-full border border-blue-100/60 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                disabled={isSubmitting}
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-2">
                概要（任意）
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="ニーズの簡単な概要を記載してください"
                className="w-full border border-blue-100/60 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-2">
                詳細（任意）
              </label>
              <textarea
                id="body"
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder="より詳しい内容があれば記載してください"
                className="w-full border border-blue-100/60 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                rows={5}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-2">
                地域（任意）
              </label>
              <input
                id="area"
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="例：港区、渋谷区など"
                className="w-full border border-blue-100/60 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex-1 px-6 py-3 bg-blue-500/90 text-white rounded-full font-medium hover:bg-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? '投稿中...' : '投稿する'}
              </button>
              
              <Link
                href="/needs"
                className="px-6 py-3 border border-blue-100/60 text-slate-700 rounded-full hover:bg-blue-50/50 transition-all text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>ℹ️ 簡易投稿について</strong><br />
              こちらは最小限の投稿機能です。投稿されたニーズは下書きとして保存され、後から詳細を追加できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}