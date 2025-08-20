import Link from "next/link";

const EVENTS = [
  { 
    id: 1, 
    title: "地域イベント特集", 
    desc: "高知県内の注目イベント",
    href: "/events",
    color: "bg-orange-50 border-orange-200"
  },
  { 
    id: 2, 
    title: "事業者紹介", 
    desc: "登録事業者のご紹介",
    href: "/vendors",
    color: "bg-blue-50 border-blue-200"
  },
  { 
    id: 3, 
    title: "成功事例", 
    desc: "マッチング成功事例",
    href: "/success",
    color: "bg-green-50 border-green-200"
  },
  { 
    id: 4, 
    title: "地域特集", 
    desc: "高知県の魅力",
    href: "/region",
    color: "bg-purple-50 border-purple-200"
  },
];

export default function EventsGrid() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">イベント・特集</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENTS.map(event => (
            <Link 
              key={event.id} 
              href={event.href}
              className={`block p-6 rounded-xl border-2 hover:shadow-md transition-all ${event.color}`}
            >
              <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{event.desc}</p>
              <div className="text-sky-700 text-sm font-medium">詳しく見る →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
