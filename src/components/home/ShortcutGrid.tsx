import Link from "next/link";

const SHORTCUTS = [
  { title: "人気のニーズ", href: "/needs?sort=trending", color: "bg-red-50 border-red-200" },
  { title: "事業者登録", href: "/vendor/register", color: "bg-blue-50 border-blue-200" },
  { title: "提案ガイド", href: "/guide/offer", color: "bg-green-50 border-green-200" },
  { title: "サービス航海図", href: "/how-it-works", color: "bg-purple-50 border-purple-200" },
  { title: "使い方ガイド", href: "/guide/using", color: "bg-orange-50 border-orange-200" },
  { title: "無料相談", href: "/support", color: "bg-teal-50 border-teal-200" },
];

export default function ShortcutGrid() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">よく使われる機能</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SHORTCUTS.map((shortcut, index) => (
            <Link 
              key={index} 
              href={shortcut.href}
              className={`block p-6 rounded-xl border-2 hover:shadow-md transition-all ${shortcut.color}`}
            >
              <div className="text-center">
                <h3 className="font-semibold text-slate-900">{shortcut.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
