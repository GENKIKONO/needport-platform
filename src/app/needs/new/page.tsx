"use client";
import { useState } from "react";
import Link from "next/link";

export default function NewNeedPage(){
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    region: "",
    summary: "",
    body: "",
    pii_email: "",
    pii_phone: "",
    pii_address: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData){
    setIsSubmitting(true);
    try {
      const payload = {
        title: String(formData.get('title')||'').trim(),
        category: String(formData.get('category')||'').trim(),
        region: String(formData.get('region')||'').trim(),
        summary: String(formData.get('summary')||'').trim(),
        body: String(formData.get('body')||'').trim(),
        pii_email: String(formData.get('pii_email')||'').trim(),
        pii_phone: String(formData.get('pii_phone')||'').trim(),
        pii_address: String(formData.get('pii_address')||'').trim(),
      };
      
      const res = await fetch('/api/needs', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
      
      if(!res.ok){ 
        const errorData = await res.json();
        alert(`投稿に失敗しました: ${errorData.error || '不明なエラー'}`); 
        return; 
      }
      
      const json = await res.json();
      window.location.href = `/needs/${json.id}`;
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
          {/* 基本情報 */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-800">基本情報</h2>
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">カテゴリ</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="リフォーム">リフォーム・建築</option>
                    <option value="移動支援">移動・送迎</option>
                    <option value="家事支援">家事・生活支援</option>
                    <option value="不動産">不動産</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">地域</label>
                  <input 
                    type="text" 
                    name="region"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                    placeholder="例: 港区"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">要約</label>
                <input 
                  type="text" 
                  name="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                  placeholder="例: 自宅にサウナを設置したく、工事業者を探しています"
                />
                <p className="text-xs text-slate-500 mt-1">1〜2行でニーズの概要をお書きください</p>
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

          {/* 連絡先情報 */}
          <div className="space-y-6 pt-6 border-t border-blue-100/50">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-800">連絡先情報</h2>
              <span className="text-xs bg-blue-100/60 text-blue-700 px-2 py-1 rounded-full">提案者のみ表示</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">メールアドレス</label>
                <input 
                  type="email" 
                  name="pii_email"
                  value={formData.pii_email}
                  onChange={(e) => setFormData({...formData, pii_email: e.target.value})}
                  className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">電話番号</label>
                  <input 
                    type="tel" 
                    name="pii_phone"
                    value={formData.pii_phone}
                    onChange={(e) => setFormData({...formData, pii_phone: e.target.value})}
                    className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                    placeholder="090-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">住所</label>
                  <input 
                    type="text" 
                    name="pii_address"
                    value={formData.pii_address}
                    onChange={(e) => setFormData({...formData, pii_address: e.target.value})}
                    className="w-full px-4 py-3 border border-blue-100/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
                    placeholder="東京都港区..."
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600/70 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-slate-800 mb-1">プライバシーについて</p>
                    <p className="text-slate-600 leading-relaxed">
                      連絡先情報は提案者のみに表示されます。事業者が提案する際に、デポジット支払いによってこれらの情報が開示される仕組みです。
                    </p>
                  </div>
                </div>
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