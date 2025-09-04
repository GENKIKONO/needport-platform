export default function InfoPage(){
  return <div className="mx-auto max-w-4xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">会社情報・規約</h1>
    <div className="space-y-4">
      <section>
        <h2 className="text-lg font-semibold">会社概要</h2>
        <p className="text-slate-600">NeedPortの会社情報がここに表示されます。</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">利用規約</h2>
        <p className="text-slate-600">サービス利用規約の内容がここに表示されます。</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">プライバシーポリシー</h2>
        <p className="text-slate-600">プライバシーポリシーの内容がここに表示されます。</p>
      </section>
    </div>
  </div>;
}