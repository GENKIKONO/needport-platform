import Link from "next/link";

async function getNeed(id: string) {
  // 既存の公開APIに合わせて取得（必要に応じて修正）
  const url = `${process.env.PLATFORM_ORIGIN ?? ""}/api/needs/list?id=${id}&per=1`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return (json?.rows?.[0]) || null;
  } catch { return null; }
}

export default async function NeedDetailV2({ params }: { params: { id: string } }) {
  const need = await getNeed(params.id);

  if (!need) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-slate-600">ニーズが見つかりませんでした。</div>
        <Link className="text-sky-700 underline mt-3 inline-block" href="/v2/needs">一覧に戻る</Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{need.title ?? "ニーズ詳細"}</h1>
        <div className="text-sm text-slate-500">
          {need.region ? `地域: ${need.region}` : null} {need.category ? ` / カテゴリ: ${need.category}` : null}
        </div>
      </header>

      <section className="p-4 border rounded-lg bg-white">
        <h2 className="font-medium text-slate-900">概要</h2>
        <p className="mt-2 text-slate-700 whitespace-pre-wrap">{need.summary ?? "—"}</p>
      </section>

      {/* ★ フロー案内（匿名→条件調整→成約で顔合わせ） */}
      <section className="p-4 border rounded-lg bg-slate-50">
        <h3 className="font-medium text-slate-900">取引のながれ（フラットなマッチング）</h3>
        <ol className="mt-2 list-decimal pl-5 text-slate-700 space-y-1">
          <li>投稿段階では <span className="font-semibold">双方匿名</span>。まずは条件のすり合わせ（提案/メッセージ）。</li>
          <li>管理者承認後、相手に表示されます（個人情報やNGワードを自動チェック）。</li>
          <li>成約/承認に至ったときに、必要な範囲で情報が <span className="font-semibold">初めて開示</span> されます。</li>
        </ol>
        <div className="mt-2 text-xs text-slate-500">
          ※ 業種により「決済で開示」「承認で開示」などの差分があります（事業者リストで確認）。
        </div>
      </section>

      <section className="p-4 border rounded-lg bg-white">
        <div className="flex flex-wrap gap-3">
          <Link href={`/proposals/${need.id}/chat`} className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">
            条件をすり合わせる（チャット）
          </Link>
          <Link href="/v2/needs" className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50">
            一覧に戻る
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">※ メッセージは管理者承認後に相手に表示されます。</p>
      </section>
    </main>
  );
}
