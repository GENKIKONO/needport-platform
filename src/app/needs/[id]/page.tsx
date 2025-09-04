export default function NeedDetail(){
  return <div className="mx-auto max-w-3xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">ニーズ詳細（雛形）</h1>
    <p className="text-slate-600">PIIは閲覧解放まで伏字で表示されます。</p>
    <div id="cta" className="pt-4 flex gap-2">
      <a className="px-3 py-2 rounded bg-sky-600 text-white" href="#">閲覧解放（事業者課金）</a>
      <a className="px-3 py-2 rounded border" href="#">提案する</a>
      <a className="px-3 py-2 rounded border" href="#">シェア</a>
    </div>
  </div>;
}
