export const metadata = { title: "ガイド – NeedPort" };
export const dynamic = 'force-dynamic';

export default function Guide(){
  return (
    <div className="container-page py-10 space-y-6">
      <h1 className="text-2xl font-bold">使い方ガイド</h1>
      <ol className="list-decimal list-inside space-y-2 text-slate-700">
        <li>ニーズを匿名で投稿し、賛同を集めます。</li>
        <li>承認制チャットで条件のすり合わせ（提案ごとに独立）。</li>
        <li>成約時に必要最小限だけ開示して取引へ。</li>
      </ol>
    </div>
  );
}
