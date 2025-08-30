'use client';
import { useState } from 'react';

export default function CmsLoginPage() {
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/cms/login', { 
      method: 'POST', 
      body: new URLSearchParams({ pass }) 
    });
    if (res.ok) location.href = '/cms';
    else setMsg('パスワードが違います');
  }
  
  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">CMS ログイン</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input 
          type="password" 
          value={pass} 
          onChange={(e)=>setPass(e.target.value)}
          className="w-full border rounded px-3 py-2" 
          placeholder="CMS_PASS" 
        />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="px-4 py-2 bg-black text-white rounded">ログイン</button>
      </form>
    </main>
  );
}
