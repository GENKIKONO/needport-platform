export const metadata = { title: "提案ガイド（事業者）" };
export default function VendorProposalGuide(){
  return <div className="mx-auto max-w-4xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">提案ガイド（事業者）</h1>
    <ul className="list-disc pl-5 space-y-1 text-slate-700">
      <li>閲覧解放後、具体・見積・実施条件を端的に</li>
      <li>NG：個人情報要求・外部誘導。すべてチャット内で完結</li>
      <li>返信SLA：24h以内。既読スルーを避ける</li>
      <li>成約時は規約準拠（10%手数料・Stripe請求）</li>
    </ul>
  </div>;
}
