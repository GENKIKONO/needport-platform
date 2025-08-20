export default function UsingGuide(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">使い方ガイド</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">ニーズの投稿</h2>
          <ol className="space-y-2 text-slate-700">
            <li>1. 「ニーズを投稿」から新規作成</li>
            <li>2. タイトルと詳細を入力</li>
            <li>3. カテゴリと地域を選択</li>
            <li>4. 公開して提案を待つ</li>
          </ol>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">ニーズの検索</h2>
          <ol className="space-y-2 text-slate-700">
            <li>1. キーワードで検索</li>
            <li>2. 地域やカテゴリで絞り込み</li>
            <li>3. 興味のあるニーズを見つける</li>
            <li>4. 賛同や提案を行う</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
