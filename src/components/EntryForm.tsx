"use client";
import { useState } from "react";

export default function EntryForm({ needId }: { needId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const nameError = !name.trim() ? "名前を入力してください" : 
                   name.length > 120 ? "名前は120文字以下で入力してください" : null;
  
  const emailError = !email.trim() ? "メールアドレスを入力してください" :
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "有効なメールアドレスを入力してください" :
                    email.length > 200 ? "メールアドレスは200文字以下で入力してください" : null;
  
  const countError = !count || Number(count) < 1 || Number(count) > 100 ? 
                    "参加人数は1以上100以下で入力してください" : null;
  
  const noteError = note.length > 500 ? "備考は500文字以下で入力してください" : null;
  
  const hasErrors = nameError || emailError || countError || noteError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasErrors) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/needs/${needId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          count: Number(count),
          note: note.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "申し込みに失敗しました");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setCount("1");
      setNote("");
    } catch (e: any) {
      setError(e?.message ?? "申し込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card border-emerald-500/40 bg-emerald-600/20 text-emerald-200">
        <h3 className="font-medium mb-2">お申し込みを受け付けました</h3>
        <p className="text-sm opacity-80">
          ご登録いただいたメールアドレスに確認メールをお送りします。
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm underline hover:no-underline"
        >
          別の申し込みをする
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-medium">参加申し込み</h3>
      
      <div>
        <label className="block text-sm mb-1">
          お名前 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            nameError ? "ring-red-500" : "ring-white/10"
          }`}
          placeholder="山田太郎"
          maxLength={120}
        />
        {nameError && <div className="mt-1 text-xs text-red-400">{nameError}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">
          メールアドレス <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            emailError ? "ring-red-500" : "ring-white/10"
          }`}
          placeholder="example@email.com"
          maxLength={200}
        />
        {emailError && <div className="mt-1 text-xs text-red-400">{emailError}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">
          参加人数 <span className="text-red-400">*</span>
        </label>
        <select
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            countError ? "ring-red-500" : "ring-white/10"
          }`}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}人</option>
          ))}
        </select>
        {countError && <div className="mt-1 text-xs text-red-400">{countError}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">
          備考
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            noteError ? "ring-red-500" : "ring-white/10"
          }`}
          rows={3}
          placeholder="ご質問やご要望があればお書きください"
          maxLength={500}
        />
        {noteError && <div className="mt-1 text-xs text-red-400">{noteError}</div>}
        <div className="mt-1 text-xs text-gray-400 text-right">
          {note.length}/500
        </div>
      </div>

      {/* Honeypot field */}
      <input
        type="text"
        name="website"
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
      />

      {error && (
        <div className="text-sm text-red-400 bg-red-600/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || hasErrors}
        className="w-full rounded-lg bg-emerald-600 text-white py-2 font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "送信中..." : "申し込む"}
      </button>
    </form>
  );
}
