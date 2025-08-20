export default function GovernmentGuide() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">自治体向けガイド</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">地域課題の解決</h2>
          <ol className="space-y-2 text-slate-700">
            <li>1. 地域のニーズを把握</li>
            <li>2. 課題の整理と優先順位付け</li>
            <li>3. 解決策の検討</li>
            <li>4. 事業者の選定と連携</li>
            <li>5. 実装と効果測定</li>
          </ol>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">活用事例</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• デジタル化推進プロジェクト</li>
            <li>• 地域活性化イベント</li>
            <li>• 高齢者サポートシステム</li>
            <li>• 観光促進アプリ開発</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
