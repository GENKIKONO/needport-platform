"use client";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from 'react';

export default function SignupClient() {
  const sp = useSearchParams();
  const preNeed = sp.get('need') ?? '';
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <main className="container py-10">
      <div className="card p-6 md:p-8">
        <h1 className="text-xl font-semibold text-white">無料登録</h1>
        <p className="mt-2 text-neutral-300 text-sm">メールアドレスだけで仮登録できます。運営より順次ご案内します。</p>

        {ok ? (
          <div className="mt-6 card border-emerald-500/40 bg-emerald-500/5 p-4">
            <p className="text-emerald-300 text-sm">送信しました。数分以内にご案内メールが届きます。</p>
            <a href="/" className="btn btn-primary mt-3">トップへ戻る</a>
          </div>
        ) : (
          <form
            className="mt-6 grid gap-4 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              setErr(null);
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const payload = {
                name: String(fd.get('name') || ''),
                email: String(fd.get('email') || ''),
                message: String(fd.get('message') || ''),
                needId: String(fd.get('needId') || ''),
              };
              start(async () => {
                const res = await fetch('/api/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (res.ok) setOk(true);
                else setErr('送信に失敗しました。時間をおいて再度お試しください。');
              });
            }}
          >
            <input name="name" placeholder="お名前" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white" />
            <input name="email" placeholder="メールアドレス" type="email" required className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white" />
            <input name="needId" defaultValue={preNeed} placeholder="興味のある案件ID（任意）" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white" />
            <textarea name="message" placeholder="一言メッセージ（任意）" className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white h-28" />
            {err && <p className="text-rose-300 text-sm">{err}</p>}
            <button disabled={pending} className="btn btn-primary">{pending ? '送信中…' : '送信する'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
