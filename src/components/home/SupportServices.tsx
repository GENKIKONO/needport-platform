import Link from "next/link";

const CARDS = [
  { 
    title: "仕事探しとお部屋探し", 
    desc: "地域のニーズと住まいを同時に探せます。", 
    href: "/needs",
    icon: "🏠"
  },
  { 
    title: "オファー応募", 
    desc: "見つけたニーズにすぐに応募できます。", 
    href: "/guide/offer",
    icon: "📝"
  },
  { 
    title: "無料相談", 
    desc: "使い方・安全・トラブルもお気軽に。", 
    href: "/support",
    icon: "💬"
  },
];

export default function SupportServices(){
  return (
    <section className="section bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">仙台風支援フロー</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map(c => (
            <Link key={c.href} href={c.href} className="block rounded-xl bg-white p-6 ring-1 ring-slate-200 hover:shadow-md transition">
              <div className="text-center">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{c.desc}</p>
                <div className="text-sky-700 text-sm font-medium">詳しく見る →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
