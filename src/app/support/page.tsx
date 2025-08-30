export default function Support(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">サポート</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">相談の流れ</h2>
          <ol className="space-y-2 text-slate-700">
            <li>1. お問い合わせフォームからご連絡</li>
            <li>2. 担当者より24時間以内に返信</li>
            <li>3. 必要に応じてオンライン面談</li>
            <li>4. 解決策のご提案</li>
          </ol>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">お問い合わせ</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">お名前</label>
              <input type="text" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">メールアドレス</label>
              <input type="email" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">お問い合わせ内容</label>
              <textarea rows={4} className="w-full rounded-md border px-3 py-2"></textarea>
            </div>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md">
              送信する
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
