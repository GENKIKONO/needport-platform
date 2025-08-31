'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState<string|null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const fd = new FormData(e.currentTarget);
    //@ts-ignore
    const token = await window.turnstile?.getResponse?.();
    const res = await fetch('/api/contact', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({
        email: fd.get('email') || undefined,
        name: fd.get('name') || undefined,
        subject: fd.get('subject') || undefined,
        body: fd.get('body'),
        cfToken: token
      })
    });
    if (res.ok) {
      setMsg('送信しました。追ってご連絡します。');
      e.currentTarget.reset();
      //@ts-ignore
      window.turnstile?.reset?.();
    } else {
      const j = await res.json().catch(()=>({}));
      setMsg(`送信に失敗しました: ${j.error ?? 'unknown'}`);
    }
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">お問い合わせ</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="お名前（任意）" className="border rounded px-3 py-2"/>
          <input name="email" placeholder="メール（任意）" className="border rounded px-3 py-2" type="email"/>
        </div>
        <input name="subject" placeholder="件名（任意）" className="border rounded px-3 py-2 w-full"/>
        <textarea name="body" placeholder="ご用件（10〜5000文字）" className="border rounded px-3 py-2 w-full h-40" required/>
        {/* Turnstile */}
        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}></div>
        <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">
          {loading ? '送信中…' : '送信'}
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
      <p className="text-sm text-gray-500">※ ボット対策のため認証を実施しています。</p>
    </main>
  );
}
