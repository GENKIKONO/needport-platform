export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import AdminBar from "@/components/admin/AdminBar";
import { formatMoney } from "@/lib/format";

export default async function NeedSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Get need with adopted offer
    const { data: need, error: needError } = await admin
      .from("needs")
      .select(`
        id,
        title,
        created_at,
        min_people,
        deadline,
        adopted_offer_id,
        offers!inner(
          id,
          vendor_name,
          amount
        )
      `)
      .eq("id", id)
      .not("adopted_offer_id", "is", null)
      .single();

    if (needError || !need) {
      return (
        <div className="p-6 text-red-500">
          募集が見つからないか、採用されたオファーがありません。
        </div>
      );
    }

    const adoptedOffer = need.offers?.[0];

    // Get all offers for comparison
    const { data: allOffers } = await admin
      .from("offers")
      .select("id, vendor_name, amount")
      .eq("need_id", id)
      .order("amount", { ascending: true });

    const otherOffers = allOffers?.filter(o => o.id !== adoptedOffer?.id) || [];

    return (
      <div className="space-y-6">
        <AdminBar title="決定内容サマリー" />
        
        {/* Print controls */}
        <div className="p-6 print:hidden">
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-emerald-200 hover:bg-emerald-600/30"
            >
              印刷 / PDF保存
            </button>
            <a
              href={`/admin/needs/${id}/offers`}
              className="rounded-lg border border-white/10 px-4 py-2 text-white hover:bg-white/5"
            >
              オファー比較に戻る
            </a>
          </div>
        </div>

        {/* Printable content */}
        <div className="p-6 bg-white text-black print:p-0">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-3xl font-bold mb-2">決定内容サマリー</h1>
              <p className="text-gray-600">
                作成日: {new Date(need.created_at).toLocaleDateString("ja-JP")}
              </p>
              <p className="text-gray-600">募集ID: {need.id}</p>
            </div>

            {/* Need Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">募集内容</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{need.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">最低人数:</span> {need.min_people || "未設定"}
                  </div>
                  <div>
                    <span className="font-medium">締切:</span> {need.deadline || "未設定"}
                  </div>
                </div>
              </div>
            </div>

            {/* Adopted Offer */}
            {adoptedOffer && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">採用オファー</h2>
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-green-800">
                        {adoptedOffer.vendor_name}
                      </h3>
                      <p className="text-green-600">採用決定</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">
                        {formatMoney(adoptedOffer.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Offers */}
            {otherOffers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">参考: 他オファー一覧</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">提供者</th>
                        <th className="border border-gray-300 p-2 text-right">金額</th>
                        <th className="border border-gray-300 p-2 text-right">差額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherOffers.map((offer) => {
                        const difference = adoptedOffer ? offer.amount - adoptedOffer.amount : 0;
                        return (
                          <tr key={offer.id}>
                            <td className="border border-gray-300 p-2">{offer.vendor_name}</td>
                            <td className="border border-gray-300 p-2 text-right">
                              {formatMoney(offer.amount)}
                            </td>
                            <td className={`border border-gray-300 p-2 text-right ${
                              difference > 0 ? "text-red-600" : "text-green-600"
                            }`}>
                              {difference > 0 ? "+" : ""}{formatMoney(difference)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">備考</h2>
              <div className="border border-gray-300 p-4 rounded-lg min-h-[100px]">
                <p className="text-gray-600 italic">
                  ※ このサマリーは決定内容の記録として作成されました。
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4 text-center text-gray-600">
              <p>NeedPort - 募集管理プラットフォーム</p>
              <p>印刷日時: {new Date().toLocaleString("ja-JP")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-6 text-red-500">
        サマリーの生成に失敗しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{error?.message ?? String(error)}</pre>
      </div>
    );
  }
}
