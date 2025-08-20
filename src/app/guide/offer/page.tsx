export default function OfferGuide() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">提案ガイド</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">提案の流れ</h2>
          <ol className="space-y-2 text-slate-700">
            <li>1. 興味のあるニーズを見つける</li>
            <li>2. 詳細を確認して提案内容を検討</li>
            <li>3. 提案フォームから応募</li>
            <li>4. 投稿者とのやり取り</li>
            <li>5. 合意形成と実装</li>
          </ol>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">提案のコツ</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• 具体的な解決策を提示する</li>
            <li>• 実績や事例を交える</li>
            <li>• 予算やスケジュールを明確にする</li>
            <li>• 丁寧で分かりやすい文章を心がける</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
