export default function VendorInterviews() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">事業者インタビュー</h1>
      <div className="mt-6 space-y-6">
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🎤</div>
          <h2 className="text-lg font-semibold mb-2">インタビュー準備中</h2>
          <p className="text-slate-600">登録事業者の声をお届けします。</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">IT企業の声</h3>
            <p className="text-sm text-slate-600">システム開発会社の事例</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">デザイン会社の声</h3>
            <p className="text-sm text-slate-600">クリエイティブ業界の事例</p>
          </div>
        </div>
      </div>
    </main>
  );
}
