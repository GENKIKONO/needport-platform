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
          >
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
          >
            {fav ? "★ お気に入り中" : "☆ お気に入り"}
          </button>
        </div>
      )}
    </LockedActionGuard>
  );
}
