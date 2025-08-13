export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import AdminBar from "@/components/admin/AdminBar";

type Entry = {
  id: string;
  name: string;
  email: string;
  count: number;
  note: string | null;
  created_at: string;
};

export default async function EntriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get need data for progress calculation
    const { data: needData } = await supabase
      .from("needs")
      .select("min_people, adopted_offer_id")
      .eq("id", id)
      .single();

    // Get entries
    const { data: entries, error } = await supabase
      .from("entries")
      .select("id, name, email, count, note, created_at")
      .eq("need_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return (
        <div className="p-6 text-red-500">
          読み込みに失敗しました。
          <pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
        </div>
      );
    }

    const entriesList: Entry[] = entries || [];
    const totalCount = entriesList.reduce((sum, entry) => sum + entry.count, 0);
    const minPeople = needData?.min_people;
    const progressPercentage = minPeople ? Math.min((totalCount / minPeople) * 100, 100) : 0;

    return (
      <div className="space-y-6">
        <AdminBar title="参加者一覧" />
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">参加者一覧</h1>

          {/* Progress Section */}
          {minPeople && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">進捗状況</span>
                <span className="text-sm text-gray-400">
                  {totalCount} / {minPeople} 人
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {progressPercentage >= 100 ? "目標達成！" : `${Math.round(progressPercentage)}% 達成`}
              </div>
            </div>
          )}

          {/* CSV Download */}
          <div className="mb-6">
            <a
              href={`/admin/needs/${id}/entries.csv`}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSVダウンロード
            </a>
          </div>

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3">名前</th>
                  <th className="text-left p-3">メールアドレス</th>
                  <th className="text-left p-3">参加人数</th>
                  <th className="text-left p-3">備考</th>
                  <th className="text-left p-3">申込日時</th>
                </tr>
              </thead>
              <tbody>
                {entriesList.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-medium">{entry.name}</td>
                    <td className="p-3 text-gray-300">{entry.email}</td>
                    <td className="p-3">{entry.count} 人</td>
                    <td className="p-3 text-gray-400 max-w-xs truncate">
                      {entry.note || "-"}
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(entry.created_at).toLocaleString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entriesList.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              参加申し込みがありません。
            </div>
          )}
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
