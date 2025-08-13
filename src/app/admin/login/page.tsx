"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const next = sp.get("next") || "/admin";

  // Fetch CSRF token on component mount
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const res = await fetch("/api/admin/csrf");
        if (res.ok) {
          const data = await res.json();
          setCsrfToken(data.token);
        } else {
          setErr("セキュリティトークンの取得に失敗しました");
        }
      } catch (error) {
        setErr("ネットワークエラーが発生しました");
      } finally {
        setIsInitializing(false);
      }
    }

    fetchCsrfToken();
    setPin("");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, csrfToken }),
      });
      
      const json = await res.json().catch(() => null);
      
      if (!res.ok || !json?.ok) {
        setErr(json?.error || "ログインに失敗しました");
        return;
      }
      
      router.push(next);
    } catch (error) {
      setErr("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm opacity-70">初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-5">
        <h1 className="mb-4 text-lg font-semibold">管理ログイン</h1>
        
        <label htmlFor="pin" className="block text-sm opacity-70 mb-2">
          PINコード
        </label>
        <input
          id="pin"
          type="password"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
          placeholder="****"
          required
          disabled={isLoading}
        />
        
        {/* CSRF Token (hidden) */}
        <input type="hidden" name="csrfToken" value={csrfToken} />
        
        {err && (
          <div className="mt-3 text-sm text-red-400" role="alert">
            {err}
          </div>
        )}
        
        <div className="mt-4 flex items-center gap-3">
          <button 
            type="submit" 
            className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "認証中..." : "入室する"}
          </button>
          <a href="/" className="text-sm opacity-70 hover:underline">
            トップへ戻る
          </a>
        </div>
      </form>
    </div>
  );
}
