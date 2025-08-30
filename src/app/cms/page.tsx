'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r=>r.json());

export default function CmsPage() {
  const [auth, setAuth] = useState<'unknown'|'ok'|'ng'>('unknown');
  const [pwd, setPwd] = useState('');

  useEffect(() => { // 既にクッキーがあればOK扱い（API保存時にエラーで判断）
    setAuth('ng'); // 初回は非認証表示
  }, []);

  const tryLogin = async () => {
    const res = await fetch('/api/cms/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: pwd })});
    const j = await res.json();
    setAuth(j.ok ? 'ok' : 'ng');
  };

  const logout = async () => {
    await fetch('/api/cms/auth', { method:'DELETE' });
    setAuth('ng');
  };

  const { data, mutate } = useSWR('/api/cms', fetcher);
  const [saving, setSaving] = useState(false);
  if (!data) return <div className="p-6">読み込み中…</div>;

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

  const canWrite = auth === 'ok' && process.env.NEXT_PUBLIC_CMS_WRITE !== '0' && process.env.NEXT_PUBLIC_CMS_WRITE !== 'false';

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">CMS（簡易）</h1>
      {auth !== 'ok' ? (
        <div className="max-w-sm rounded border p-4 space-y-2">
          <p className="text-sm text-gray-600">編集はパスワードが必要です。閲覧はどなたでも可能です。</p>
          <input type="password" className="w-full border rounded px-2 py-1" placeholder="パスワード" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
          <button onClick={tryLogin} className="px-3 py-1 rounded bg-black text-white">認証</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-sm">編集モード</span>
          <button onClick={logout} className="px-2 py-1 text-sm rounded border">ログアウト</button>
        </div>
      )}

      <div className="space-y-8">

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

      {canWrite && (
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
      )}
      </div>
    </div>
  );
}
