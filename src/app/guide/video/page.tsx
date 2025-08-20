export default function GuideVideo() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">使い方動画</h1>
      <div className="mt-6 space-y-6">
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📹</div>
          <h2 className="text-lg font-semibold mb-2">動画コンテンツ準備中</h2>
          <p className="text-slate-600">NeedPortの使い方を動画で分かりやすく解説します。</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">ニーズの投稿方法</h3>
            <p className="text-sm text-slate-600">ステップバイステップで投稿の流れを解説</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">提案の仕方</h3>
            <p className="text-sm text-slate-600">効果的な提案のコツを紹介</p>
          </div>
        </div>
      </div>
    </main>
  );
}
