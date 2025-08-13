"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Need = {
  id: string;
  title: string;
  min_people: number | null;
  deadline: string | null;
  recruitment_closed: boolean;
};

export default function NeedEditForm({ need }: { need: Need }) {
  const router = useRouter();
  const [title, setTitle] = useState(need.title);
  const [minPeople, setMinPeople] = useState<string>(need.min_people?.toString() ?? "");
  const [deadline, setDeadline] = useState<string>(need.deadline ?? "");
  const [recruitmentClosed, setRecruitmentClosed] = useState(need.recruitment_closed);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "タイトルを入力してください";
    } else if (title.length > 120) {
      newErrors.title = "タイトルは120文字以下で入力してください";
    }

    if (minPeople.trim()) {
      const num = Number(minPeople);
      if (!Number.isInteger(num) || num <= 0) {
        newErrors.minPeople = "最低人数は正の整数で入力してください";
      }
    }

    if (deadline.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(deadline)) {
        newErrors.deadline = "日付は YYYY-MM-DD 形式で入力してください";
      } else {
        const date = new Date(deadline);
        if (isNaN(date.getTime())) {
          newErrors.deadline = "有効な日付を入力してください";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload: any = {
        title: title.trim(),
        recruitment_closed: recruitmentClosed,
        updated_at: new Date().toISOString(),
      };

      if (minPeople.trim()) {
        payload.min_people = Number(minPeople);
      } else {
        payload.min_people = null;
      }

      if (deadline.trim()) {
        payload.deadline = deadline;
      } else {
        payload.deadline = null;
      }

      const res = await fetch(`/api/admin/needs/${need.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "更新に失敗しました");
      }

      // Redirect back to offers page with success message
      router.push(`/admin/needs/${need.id}/offers?toast=updated`);
    } catch (e: any) {
      setErrors({ general: e?.message ?? "更新に失敗しました" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            errors.title ? "ring-red-500" : "ring-white/10"
          }`}
          placeholder="ニーズのタイトル"
          maxLength={120}
        />
        {errors.title && <div className="mt-1 text-sm text-red-400">{errors.title}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          最低人数
        </label>
        <input
          type="text"
          value={minPeople}
          onChange={(e) => setMinPeople(e.target.value.replace(/[^\d]/g, ""))}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            errors.minPeople ? "ring-red-500" : "ring-white/10"
          }`}
          placeholder="例: 10"
        />
        {errors.minPeople && <div className="mt-1 text-sm text-red-400">{errors.minPeople}</div>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          締切
        </label>
        <input
          type="text"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={`w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ${
            errors.deadline ? "ring-red-500" : "ring-white/10"
          }`}
          placeholder="2025-12-31"
        />
        {errors.deadline && <div className="mt-1 text-sm text-red-400">{errors.deadline}</div>}
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={recruitmentClosed}
            onChange={(e) => setRecruitmentClosed(e.target.checked)}
            className="rounded border-white/10 bg-zinc-800"
          />
          <span className="text-sm font-medium">募集を終了する</span>
        </label>
      </div>

      {errors.general && (
        <div className="text-sm text-red-400 bg-red-600/20 p-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "更新中..." : "更新する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-white/10 px-4 py-2 font-medium hover:bg-white/5"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
