import Link from "next/link";

const CARDS = [
  { title: "投稿サポート", desc: "テンプレと事例で迷わず公開まで。", href: "/guide/posting" },
  { title: "提案サポート", desc: "見つけて・提案して・つながる。", href: "/guide/offer" },
  { title: "無料相談",   desc: "使い方・安全・トラブルもお気軽に。", href: "/support" },
];

export default function SupportServices(){
  return (
    <section className="max-w-6xl mx-auto px-4">
      <h2 className="text-xl font-bold mb-6">支援サービス</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {CARDS.map(c => (
          <Link key={c.href} href={c.href} className="block rounded-xl bg-white p-6 ring-1 ring-slate-200 hover:shadow-md transition">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="mt-2 text-slate-600 text-sm">{c.desc}</p>
            <div className="mt-4 text-sky-700 text-sm">詳しく見る</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
