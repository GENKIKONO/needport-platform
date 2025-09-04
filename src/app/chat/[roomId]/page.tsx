export default function ChatRoom(){
  return <div className="mx-auto max-w-4xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">チャット（雛形）</h1>
    <p className="text-slate-600">チャット機能がここに実装されます。</p>
    <div className="border rounded p-4 h-64 bg-slate-50">
      <p className="text-slate-500">メッセージ履歴がここに表示されます</p>
    </div>
    <div className="flex gap-2">
      <input type="text" placeholder="メッセージを入力..." className="flex-1 px-3 py-2 border rounded" />
      <button className="px-4 py-2 bg-sky-600 text-white rounded">送信</button>
    </div>
  </div>;
}
