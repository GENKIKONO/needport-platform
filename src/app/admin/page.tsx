export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createAdminClient } from "@/lib/supabase/admin";
import AdminBar from "@/components/admin/AdminBar";
import { formatMoney } from "@/lib/format";

export default async function AdminDashboard() {
  try {
    const admin = createAdminClient();

    // Get total counts
    const [
      { count: totalNeeds },
      { count: totalOffers },
      { count: totalEntries },
      { count: todayEntries }
    ] = await Promise.all([
      admin.from("needs").select("*", { count: "exact", head: true }),
      admin.from("offers").select("*", { count: "exact", head: true }),
      admin.from("entries").select("*", { count: "exact", head: true }),
      admin.from("entries").select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0])
    ]);

    // Get needs nearing deadline (next 7 days, not closed)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data: nearingDeadline } = await admin
      .from("needs")
      .select(`
        id,
        title,
        deadline,
        min_people,
        adopted_offer_id,
        recruitment_closed,
        entries(count)
      `)
      .not("deadline", "is", null)
      .lte("deadline", sevenDaysFromNow.toISOString().split("T")[0])
      .eq("recruitment_closed", false)
      .not("adopted_offer_id", "is", null)
      .order("deadline", { ascending: true })
      .limit(10);

    // Get top needs by entries
    const { data: topNeeds } = await admin
      .from("needs")
      .select(`
        id,
        title,
        min_people,
        adopted_offer_id,
        entries(count)
      `)
      .not("adopted_offer_id", "is", null)
      .order("entries(count)", { ascending: false })
      .limit(5);

    return (
      <div className="space-y-6">
        <AdminBar title="ダッシュボード" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">ダッシュボード</h1>
            {process.env.NODE_ENV === 'development' && (
              <a href="/admin/smoke" className="text-sm text-blue-400 hover:text-blue-300 underline">
                Smoke (dev)
              </a>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg bg-blue-600/20 p-4 text-blue-200">
              <div className="text-2xl font-bold">{totalNeeds || 0}</div>
              <div className="text-sm opacity-80">合計ニーズ</div>
            </div>
            <div className="rounded-lg bg-emerald-600/20 p-4 text-emerald-200">
              <div className="text-2xl font-bold">{totalOffers || 0}</div>
              <div className="text-sm opacity-80">合計オファー</div>
            </div>
            <div className="rounded-lg bg-purple-600/20 p-4 text-purple-200">
              <div className="text-2xl font-bold">{totalEntries || 0}</div>
              <div className="text-sm opacity-80">合計応募</div>
            </div>
            <div className="rounded-lg bg-amber-600/20 p-4 text-amber-200">
              <div className="text-2xl font-bold">{todayEntries || 0}</div>
              <div className="text-sm opacity-80">本日の応募</div>
            </div>
          </div>

          {/* Nearing Deadline */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">締切が近い募集</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3">タイトル</th>
                    <th className="text-left p-3">締切</th>
                    <th className="text-left p-3">残り日数</th>
                    <th className="text-left p-3">進捗</th>
                  </tr>
                </thead>
                <tbody>
                  {nearingDeadline?.map((need) => {
                    const daysLeft = Math.ceil((new Date(need.deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const totalPeople = need.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0;
                    const progress = need.min_people ? Math.min((totalPeople / need.min_people) * 100, 100) : 0;
                    
                    return (
                      <tr key={need.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">
                          <a href={`/admin/needs/${need.id}/offers`} className="text-emerald-400 hover:underline">
                            {need.title}
                          </a>
                        </td>
                        <td className="p-3">{need.deadline}</td>
                        <td className="p-3">
                          <span className={daysLeft <= 3 ? "text-red-400" : daysLeft <= 7 ? "text-yellow-400" : ""}>
                            {daysLeft} 日
                          </span>
                        </td>
                        <td className="p-3">
                          {need.min_people ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs">{Math.round(progress)}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">未設定</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {(!nearingDeadline || nearingDeadline.length === 0) && (
              <div className="text-center py-4 text-gray-400">締切が近い募集はありません</div>
            )}
          </div>

          {/* Top Needs by Entries */}
          <div>
            <h2 className="text-lg font-medium mb-4">応募数トップ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3">タイトル</th>
                    <th className="text-left p-3">進捗</th>
                    <th className="text-left p-3">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {topNeeds?.map((need) => {
                    const totalPeople = need.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0;
                    const progress = need.min_people ? Math.min((totalPeople / need.min_people) * 100, 100) : 0;
                    
                    return (
                      <tr key={need.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">
                          <a href={`/admin/needs/${need.id}/offers`} className="text-emerald-400 hover:underline">
                            {need.title}
                          </a>
                        </td>
                        <td className="p-3">
                          {need.min_people ? (
                            <span>{totalPeople} / {need.min_people} 人</span>
                          ) : (
                            <span>{totalPeople} 人</span>
                          )}
                        </td>
                        <td className="p-3">
                          {need.adopted_offer_id && (
                            <span className="rounded-md bg-emerald-600/20 px-2 py-1 text-xs text-emerald-300">
                              採用済み
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {(!topNeeds || topNeeds.length === 0) && (
              <div className="text-center py-4 text-gray-400">応募データがありません</div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (e: any) {
    return (
      <div className="p-6 text-red-500">
        予期せぬエラーが発生しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{e?.message ?? String(e)}</pre>
      </div>
    );
  }
}
