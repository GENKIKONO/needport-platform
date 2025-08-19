"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import LockedActionGuard from "@/components/LockedActionGuard";
import { guardedFetch } from "@/lib/auth/guard-client";

export default function Actions({ id, supportsCount: initial, flagsRequireAccount }: { id: string; supportsCount?: number; flagsRequireAccount: boolean }) {
  const [count, setCount] = useState(initial ?? 0);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function support(on: boolean) {
    setLoading(true);
    try {
      const r = await guardedFetch(`/api/needs/${id}/support`, { method: on ? "POST" : "DELETE" });
      const j = await r.json(); 
      setCount(j.supportsCount ?? count);
      toast(on ? "賛同しました" : "賛同を解除しました", "success");
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        // ガード関数で既に処理済み
        return;
      }
      toast("賛同に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }

  async function favorite(on: boolean) {
    setLoading(true);
    try {
      const r = await guardedFetch(`/api/needs/${id}/favorite`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ on }) 
      });
      setFav(on); 
      toast(on ? "お気に入りに追加しました" : "お気に入りを解除しました", on ? "success" : "info");
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        // ガード関数で既に処理済み
        return;
      }
      toast("お気に入りに失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LockedActionGuard flagsRequireAccount={flagsRequireAccount}>
      {(enabled, openModal) => (
        <div className="flex items-center gap-3 mt-4">
          <button 
            onClick={() => enabled ? support(true) : openModal()} 
            disabled={loading}
            className={`px-4 py-2 rounded-md disabled:opacity-50 ${
              enabled 
                ? "bg-sky-600 text-white hover:bg-sky-700" 
                : "bg-gray-200 text-gray-500"
            }`}
            aria-label={`賛同する（現在${count}人）`}
          >
            <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            賛同する（{count}）
          </button>
          <button 
            onClick={() => enabled ? favorite(!fav) : openModal()} 
            disabled={loading}
            className={`px-4 py-2 rounded-md disabled:opacity-50 ${
              enabled 
                ? (fav 
                    ? "bg-amber-600 text-white hover:bg-amber-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                : "bg-gray-200 text-gray-500"
            }`}
            aria-label={fav ? "お気に入りから削除" : "お気に入りに追加"}
          >
            <svg className="h-4 w-4 inline mr-2" fill={fav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {fav ? "お気に入り中" : "お気に入り"}
          </button>
        </div>
      )}
    </LockedActionGuard>
  );
}
