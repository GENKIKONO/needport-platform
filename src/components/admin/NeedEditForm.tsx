"use client";
import { useState } from "react";
import type { NeedDetail, Stage } from "@/lib/admin/types";
import StageStepper from "./StageStepper";

export default function NeedEditForm({ need, onSaved }: {
  need: NeedDetail;
  onSaved?: (n: NeedDetail)=>void;
}) {
  const [form, setForm] = useState({
    title: need.title ?? "",
    body: need.body ?? "",
    estimateYen: need.estimateYen ?? 0,
    stage: need.stage as Stage,
    isPublished: need.isPublished,
    isSample: need.isSample,
    requireIntro: need.requireIntro,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/needs/${need.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      onSaved?.(updated);
      alert("保存しました");
    } catch (e:any) {
      alert("保存に失敗: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <StageStepper stage={form.stage} />
      <div className="grid gap-3">
        <label className="block">
          <div className="text-sm text-gray-600">タイトル</div>
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={form.title} onChange={(e)=>setForm(v=>({...v, title:e.target.value}))}/>
        </label>
        <label className="block">
          <div className="text-sm text-gray-600">本文</div>
          <textarea className="mt-1 w-full rounded border px-3 py-2 min-h-[120px]"
            value={form.body} onChange={(e)=>setForm(v=>({...v, body:e.target.value}))}/>
        </label>
        <label className="block">
          <div className="text-sm text-gray-600">見積(円)</div>
          <input type="number" className="mt-1 w-full rounded border px-3 py-2"
            value={form.estimateYen} onChange={(e)=>setForm(v=>({...v, estimateYen:Number(e.target.value||0)}))}/>
        </label>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.isPublished}
              onChange={(e)=>setForm(v=>({...v, isPublished:e.target.checked}))}/>
            <span>公開（一般に表示）</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.isSample}
              onChange={(e)=>setForm(v=>({...v, isSample:e.target.checked}))}/>
            <span>サンプル表示</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.requireIntro ?? false}
              onChange={(e)=>setForm(v=>({...v, requireIntro:e.target.checked}))}/>
            <span>紹介必須</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={saving}
          className="rounded bg-sky-600 text-white px-4 py-2 disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
