export default function PromoSlider() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">新機能リリース</h2>
          <p className="text-lg mb-6">事業者向け提案ツールが登場しました</p>
          <a 
            href="/guide/offer" 
            className="inline-block bg-white text-sky-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            詳しく見る
          </a>
        </div>
      </div>
    </section>
  );
}
