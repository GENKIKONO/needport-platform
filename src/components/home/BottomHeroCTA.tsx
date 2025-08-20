import Link from "next/link";

export default function BottomHeroCTA() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            運命のニーズは、ここにある。
          </h2>
          <p className="text-lg mb-8 opacity-90">
            生活から生まれるリアルなニーズが集まり、共鳴し、形になる。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/post" 
              className="inline-block bg-white text-sky-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              ニーズを投稿
            </Link>
            <Link 
              href="/needs" 
              className="inline-block bg-white/10 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              ニーズを探す
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
