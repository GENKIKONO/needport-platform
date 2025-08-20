export default function SupportGuide() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">支援者ガイド</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">支援の始め方</h2>
          <ol className="space-y-2 text-slate-700">
            <li>1. 興味のあるプロジェクトを探す</li>
            <li>2. プロジェクトの詳細を確認</li>
            <li>3. 支援方法を選択（技術支援・資金支援・人材支援）</li>
            <li>4. プロジェクトオーナーと連絡</li>
            <li>5. 支援活動の開始</li>
          </ol>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">支援の種類</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• 技術支援：開発・デザイン・マーケティング</li>
            <li>• 資金支援：クラウドファンディング・寄付</li>
            <li>• 人材支援：ボランティア・アドバイス</li>
            <li>• ネットワーク支援：人脈・情報提供</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
