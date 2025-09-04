"use client";
import { useState } from "react";

export default function NewNeedPage(){
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    region: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API送信
    console.log("Submit:", formData);
  };

  return <div className="mx-auto max-w-2xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">ニーズ投稿</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input 
          type="text" 
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">カテゴリ</label>
        <select 
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
          value={formData.region}
          onChange={(e) => setFormData({...formData, region: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">詳細</label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border rounded h-32"
          required
        />
      </div>
      <button type="submit" className="w-full px-4 py-2 bg-sky-600 text-white rounded">
        投稿する
      </button>
    </form>
  </div>;
}