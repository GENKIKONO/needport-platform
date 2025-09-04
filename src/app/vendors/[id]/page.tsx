export default function VendorDetail(){
  return <div className="mx-auto max-w-3xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">事業者詳細（雛形）</h1>
    <p className="text-slate-600">事業者の詳細情報がここに表示されます。</p>
    <div className="pt-4 flex gap-2">
      <a className="px-3 py-2 rounded bg-sky-600 text-white" href="#">お問い合わせ</a>
      <a className="px-3 py-2 rounded border" href="#">提案を依頼</a>
    </div>
  </div>;
}
