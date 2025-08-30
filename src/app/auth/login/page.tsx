"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      
      if (!res.ok) {
        if (json.error) {
          setErrors({ general: json.error });
        } else {
          setErrors({ general: "ログインに失敗しました" });
        }
        return;
      }
      
      // 成功時のメッセージ
      alert("ログインが完了しました。マイページへ移動します。");
      r.push("/me");
    } catch (e: any) {
      setErrors({ general: e.message || "ログインに失敗しました" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input 
            className={`w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">登録時のメールアドレスを入力してください</p>
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード <span className="text-red-500">*</span>
          </label>
          <input 
            className={`w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="パスワードを入力"
          />
          <p className="text-xs text-gray-500 mt-1">8文字以上のパスワードを入力してください</p>
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
        </div>
        
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}
        
        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white rounded-md p-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ログイン中...
            </span>
          ) : (
            "ログイン"
          )}
        </button>
        
        <p className="text-sm text-center text-gray-600">
          未登録の方は{" "}
          <a className="text-blue-600 hover:text-blue-700 underline" href="/auth/register">
            新規登録
          </a>
        </p>
      </form>
    </main>
  );
}
