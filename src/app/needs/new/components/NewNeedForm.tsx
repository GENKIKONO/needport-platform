"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewNeedForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    body: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        title: String(formData.get('title') || '').trim(),
        body: String(formData.get('body') || '').trim(),
      };
      
      const res = await fetch('/api/needs', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) { 
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.detail || errorData.error || `投稿エラー (${res.status})`;
        alert(`投稿に失敗しました: ${message}`); 
        return; 
      }
      
      const json = await res.json();
      // Show success message briefly before redirect  
      alert('下書きを作成しました！マイページで確認できます。');
      setTimeout(() => {
        router.push('/me');
      }, 500);
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    handleSubmit(new FormData(form));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30">
      <div className="mx-auto max-w-3xl p-6 space-y-8">
        {/* ヘッダー */}
        <header className="text-center space-y-4 py-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">ニーズを投稿</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            あなたの「困った」を声にしてみませんか？<br />
            地域の事業者があなたをサポートします。
          </p>
        </header>

        {/* フォーム */}
        <form onSubmit={handleFormSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/50 shadow-sm space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-800">ニーズ投稿</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">タイトル</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                  placeholder="例: 自宅サウナを設置したい"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">あなたの困りごとや希望を簡潔に書いてください</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">詳細説明</label>
                <textarea 
                  name="body"
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl h-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all resize-none"
                  placeholder="詳しい状況や希望をお聞かせください..."
                  required
                />
                <p className="text-xs text-slate-500 mt-1">具体的な状況や希望条件をお書きください</p>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4 pt-6">
            <Link 
              href="/needs" 
              className="px-6 py-3 border border-blue-100/60 text-slate-700 rounded-2xl hover:bg-blue-50/50 transition-all duration-300"
            >
              キャンセル
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-500/90 text-white font-semibold rounded-2xl hover:bg-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  投稿中...
                </span>
              ) : (
                '投稿する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}