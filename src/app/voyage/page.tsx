export default function Voyage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">サービス航海図</h1>
      <div className="mt-6 space-y-6">
        <ol className="space-y-4 text-slate-700">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold">1</span>
            <div>
              <h3 className="font-semibold">ニーズを投稿／登録</h3>
              <p className="text-sm text-slate-600 mt-1">生活や事業から生まれるニーズを投稿します</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold">2</span>
            <div>
              <h3 className="font-semibold">検索・提案・やりとり</h3>
              <p className="text-sm text-slate-600 mt-1">事業者がニーズを見つけて提案を行います</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold">3</span>
            <div>
              <h3 className="font-semibold">合意形成と実装</h3>
              <p className="text-sm text-slate-600 mt-1">双方が合意してプロジェクトを進めます</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold">4</span>
            <div>
              <h3 className="font-semibold">検証・改善・公開</h3>
              <p className="text-sm text-slate-600 mt-1">成果を検証し、必要に応じて改善を行います</p>
            </div>
          </li>
        </ol>
      </div>
    </main>
  );
}
