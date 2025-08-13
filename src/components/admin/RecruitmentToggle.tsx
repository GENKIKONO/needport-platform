"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface RecruitmentToggleProps {
  needId: string;
  initialClosed: boolean;
}

export default function RecruitmentToggle({ needId, initialClosed }: RecruitmentToggleProps) {
  const [closed, setClosed] = useState(initialClosed);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/needs/${needId}/close`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closed: !closed }),
      });

      const data = await res.json();

      if (res.ok) {
        setClosed(!closed);
        toast.success(data.message);
      } else {
        toast.error(data.message || "募集状態の更新に失敗しました");
      }
    } catch (error) {
      toast.error("募集状態の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10">
      <div className="flex-1">
        <h3 className="font-medium mb-1">募集状態</h3>
        <p className="text-sm text-gray-400">
          {closed ? "募集は終了しています" : "募集は継続中です"}
        </p>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          closed
            ? "bg-green-600/20 text-green-200 hover:bg-green-600/30 border border-green-500/40"
            : "bg-red-600/20 text-red-200 hover:bg-red-600/30 border border-red-500/40"
        } disabled:opacity-50`}
      >
        {loading ? "更新中..." : closed ? "募集を再開" : "募集を終了"}
      </button>
    </div>
  );
}
