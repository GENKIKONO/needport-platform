export const metadata = { title: "サービス航海図" };
export default function Roadmap(){
  return <div className="mx-auto max-w-4xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">サービス航海図</h1>
    <ol className="list-decimal list-inside space-y-2">
      <li>ニーズ投稿 → 賛同</li>
      <li>閲覧解放（事業者課金）</li>
      <li>提案 → 承認</li>
      <li>チャットで条件すり合わせ</li>
      <li>成約 → 最小限開示</li>
      <li>未成約60日 → 海中へ（再提案可／浮上あり）</li>
    </ol>
  </div>;
}
