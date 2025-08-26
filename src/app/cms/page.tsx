"use client";

import useSWR from "swr";
import { useState } from "react";

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CmsPage() {
  const { data, isLoading, mutate } = useSWR("/api/cms", fetcher);
  const [saving, setSaving] = useState(false);
  if (isLoading || !data) return <div className="p-6">Loading…</div>;

  const cms = data.data as any;

  function update(path: string, value: any) {
    // 簡易setter（pathは "serviceOverview.heroTitle" のようなキー）
    const segs = path.split(".");
    const next = structuredClone(cms);
    let cur = next;
    for (let i = 0; i < segs.length - 1; i++) cur = cur[segs[i]];
    cur[segs[segs.length - 1]] = value;
    mutate({ data: next }, false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cms),
    }).then(r => r.json());
    setSaving(false);
    if (!res.ok) alert("保存できません（read-only）。CMS_WRITE=1 を設定すると保存可能です。");
    else alert("保存しました");
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">CMS（簡易）</h1>

      {/* サービス航海図 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">サービス航海図</h2>
        <label className="block">
          <span className="text-sm text-muted">ヒーロータイトル</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={cms.serviceOverview.heroTitle}
            onChange={(e) => update("serviceOverview.heroTitle", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">リード文</span>
          <textarea
            className="mt-1 w-full border rounded px-3 py-2"
            rows={3}
            value={cms.serviceOverview.heroLead}
            onChange={(e) => update("serviceOverview.heroLead", e.target.value)}
          />
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          {cms.serviceOverview.flow.map((s: any, i: number) => (
            <div key={i} className="border rounded p-3">
              <input
                className="w-full font-semibold border-b mb-2"
                value={s.title}
                onChange={(e) => {
                  const copy = [...cms.serviceOverview.flow];
                  copy[i] = { ...copy[i], title: e.target.value };
                  update("serviceOverview.flow", copy);
                }}
              />
              <textarea
                className="w-full border rounded px-2 py-1"
                rows={3}
                value={s.items.join("\n")}
                onChange={(e) => {
                  const copy = [...cms.serviceOverview.flow];
                  copy[i] = { ...copy[i], items: e.target.value.split("\n").filter(Boolean) };
                  update("serviceOverview.flow", copy);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* トップ要約 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">トップ要約ブロック</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {cms.homeSummary.steps.map((s: any, i: number) => (
            <div key={i} className="border rounded p-3 space-y-2">
              <input
                className="w-full font-semibold border-b"
                value={s.title}
                onChange={(e) => {
                  const copy = [...cms.homeSummary.steps];
                  copy[i] = { ...copy[i], title: e.target.value };
                  update("homeSummary.steps", copy);
                }}
              />
              <textarea
                className="w-full border rounded px-2 py-1"
                rows={3}
                value={s.body}
                onChange={(e) => {
                  const copy = [...cms.homeSummary.steps];
                  copy[i] = { ...copy[i], body: e.target.value };
                  update("homeSummary.steps", copy);
                }}
              />
              <input
                className="w-full border rounded px-2 py-1"
                placeholder="リンク (任意)"
                value={s.href ?? ""}
                onChange={(e) => {
                  const copy = [...cms.homeSummary.steps];
                  copy[i] = { ...copy[i], href: e.target.value || undefined };
                  update("homeSummary.steps", copy);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ナビとフッター（見出しのみ簡易編集） */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">ナビ & フッター</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">左ナビ</h3>
            {cms.navigation.groups.map((g: any, i: number) => (
              <div key={i} className="mb-3">
                <input
                  className="w-full border rounded px-2 py-1 font-medium"
                  value={g.title}
                  onChange={(e) => {
                    const copy = [...cms.navigation.groups];
                    copy[i] = { ...copy[i], title: e.target.value };
                    update("navigation.groups", copy);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">フッター</h3>
            {cms.footer.columns.map((c: any, i: number) => (
              <div key={i} className="mb-3">
                <input
                  className="w-full border rounded px-2 py-1 font-medium"
                  value={c.title}
                  onChange={(e) => {
                    const copy = [...cms.footer.columns];
                    copy[i] = { ...copy[i], title: e.target.value };
                    update("footer.columns", copy);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-4">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={save}
          disabled={saving}
        >
          {saving ? "保存中…" : "保存する"}
        </button>
        <span className="ml-3 text-sm text-muted">
          保存できない場合はプレビュー/本番の環境変数に <code>CMS_WRITE=1</code> を設定
        </span>
      </div>
    </div>
  );
}
