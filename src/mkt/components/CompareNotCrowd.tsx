export default function CompareNotCrowd(){
  const rows = [
    ["目的","ニーズ⇆提案で案件成立","寄付/購入で資金集め"],
    ["やり取り","承認制ルーム（運営同席）","公開コメント中心"],
    ["成立条件","提案承認で進行","目標金額の到達"],
    ["決済","Stripe与信・分配","一括決済（リターン）"],
  ];
  return (
    <section className="section">
      <h2 className="text-xl font-bold mb-3">クラファンではありません</h2>
      <div className="overflow-hidden rounded-2xl border border-black/5">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr><th className="p-3 text-left">項目</th><th className="p-3 text-left">NeedPort</th><th className="p-3 text-left">クラファン</th></tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="even:bg-neutral-50/50">
                <td className="p-3 font-medium">{r[0]}</td>
                <td className="p-3 text-sky-700">{r[1]}</td>
                <td className="p-3 text-neutral-600">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
