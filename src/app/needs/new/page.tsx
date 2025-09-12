"use client";
import { useState } from "react";

export default function NewNeedPage(){
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    region: "",
    description: "",
    budgetHint: ""
  });

  async function handleSubmit(formData: FormData){
    const payload = {
      title: String(formData.get('title')||'').trim(),
      category: String(formData.get('category')||'').trim(),
      region: String(formData.get('region')||'').trim(),
      description: String(formData.get('description')||'').trim(),
      budgetHint: String(formData.get('budgetHint')||'').trim(),
    };
    const res = await fetch('/api/needs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res.ok){ alert('投稿に失敗しました'); return; }
    const json = await res.json();
    window.location.href = `/needs/${json.id}`;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    handleSubmit(new FormData(form));
  };

  return <div className="mx-auto max-w-2xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">ニーズ投稿</h1>
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <input type="hidden" name="_np" value="1" />
      <div>
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input 
          type="text" 
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">カテゴリ</label>
        <select 
          name="category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">選択してください</option>
          <option value="リフォーム">リフォーム</option>
          <option value="移動支援">移動支援</option>
          <option value="その他">その他</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">地域</label>
        <input 
          type="text" 
          name="region"
          value={formData.region}
          onChange={(e) => setFormData({...formData, region: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">詳細</label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border rounded h-32"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">予算目安（任意）</label>
        <input 
          type="text" 
          name="budgetHint"
          value={formData.budgetHint}
          onChange={(e) => setFormData({...formData, budgetHint: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          placeholder="例: 50万円〜100万円"
        />
      </div>
      <button type="submit" className="w-full px-4 py-2 bg-sky-600 text-white rounded">
        投稿する
      </button>
    </form>
  </div>;
}