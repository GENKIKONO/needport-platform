import Link from "next/link";

const FEATURES = [
  { 
    id: 1, 
    title: "使い方動画", 
    desc: "NeedPortの使い方を動画で解説",
    href: "/guide/video",
    type: "video"
  },
  { 
    id: 2, 
    title: "成功事例記事", 
    desc: "実際のマッチング成功事例",
    href: "/success/stories",
    type: "article"
  },
  { 
    id: 3, 
    title: "事業者インタビュー", 
    desc: "登録事業者の声",
    href: "/vendors/interviews",
    type: "interview"
  },
];

export default function FeaturesCarousel() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">動画・記事</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(feature => (
            <Link 
              key={feature.id} 
              href={feature.href}
              className="block p-6 bg-white rounded-xl border hover:shadow-md transition-all"
            >
              <div className="text-center">
                <div className="text-2xl mb-3">
                  {feature.type === 'video' && '🎥'}
                  {feature.type === 'article' && '📄'}
                  {feature.type === 'interview' && '🎤'}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{feature.desc}</p>
                <div className="text-sky-700 text-sm font-medium">見る →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
