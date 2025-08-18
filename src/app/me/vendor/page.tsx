"use client";
import { useEffect, useState } from "react";

export default function VendorPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    (async () => {
      const r = await fetch("/api/me/vendor"); 
      if (r.ok) { 
        const j = await r.json(); 
        setVendor(j.vendor); 
      }
    })(); 
  }, []);

  if (!vendor) return <div className="p-6">読み込み中...</div>;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const r = await fetch("/api/me/vendor", { 
      method: "PUT", 
      headers: {"Content-Type":"application/json"}, 
      body: JSON.stringify(body) 
    });
    setSaving(false);
    if (!r.ok) { 
      const j = await r.json().catch(()=>({})); 
      alert(`保存に失敗: ${j.error ?? ""}`); 
      return; 
    }
    const j = await r.json(); 
    setVendor(j.vendor); 
    alert("保存しました");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">事業者プロフィール</h1>
      <form onSubmit={save} className="space-y-3">
        <input 
          name="name" 
          defaultValue={vendor?.name ?? ""} 
          placeholder="表示名" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
        />
        <input 
          name="company" 
          defaultValue={vendor?.company ?? ""} 
          placeholder="会社名" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
        />
        <input 
          name="phone" 
          defaultValue={vendor?.phone ?? ""} 
          placeholder="電話番号" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
        />
        <input 
          name="website" 
          defaultValue={vendor?.website ?? ""} 
          placeholder="WebサイトURL" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
        />
        <textarea 
          name="intro" 
          defaultValue={vendor?.intro ?? ""} 
          placeholder="自己紹介" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          rows={4} 
        />
        <button 
          disabled={saving} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </form>
    </div>
  );
}
