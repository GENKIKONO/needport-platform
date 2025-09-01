"use client";

export default function FlowSteps() {
  return (
    <section className="rounded-lg border bg-slate-50 p-4">
      <h3 className="font-medium text-slate-900">取引のながれ（フラットなマッチング）</h3>
      <ol className="mt-2 list-decimal pl-5 text-slate-700 space-y-1">
        <li>投稿段階では <span className="font-semibold">双方匿名</span>。まずは条件のすり合わせ（提案/メッセージ）。</li>
        <li>管理者承認後、相手に表示（個人情報・NGワードは自動チェック）。</li>
        <li>成約/承認に至ったとき、必要な範囲で情報が <span className="font-semibold">初めて開示</span> されます。</li>
      </ol>
      <div className="mt-2 text-xs text-slate-500">
        ※ 業種によって「決済で開示」「承認で開示」などの差分があります（事業者リストで確認できます）。
      </div>
    </section>
  );
}
