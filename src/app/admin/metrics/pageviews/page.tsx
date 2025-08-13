import { supabaseServer } from '@/lib/server/supabase';
import AdminBar from '@/components/admin/AdminBar';

export default async function PageviewsPage() {
  const supabase = supabaseServer();
  
  // Get pageviews for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: pageviews, error } = await supabase
    .from('pageviews')
    .select('path, day, views')
    .gte('day', sevenDaysAgo.toISOString().split('T')[0])
    .order('views', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[pageviews] error:', error);
    return (
      <div className="p-6 text-red-500">
        取得に失敗しました。<pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
      </div>
    );
  }

  // Group by path and sum views
  const pathStats = pageviews?.reduce((acc, pv) => {
    if (!acc[pv.path]) {
      acc[pv.path] = { path: pv.path, totalViews: 0, days: 0 };
    }
    acc[pv.path].totalViews += pv.views;
    acc[pv.path].days += 1;
    return acc;
  }, {} as Record<string, { path: string; totalViews: number; days: number }>) || {};

  const sortedPaths = Object.values(pathStats)
    .sort((a, b) => (b as any).totalViews - (a as any).totalViews)
    .slice(0, 100) as Array<{ path: string; totalViews: number; days: number }>;

  return (
    <div className="space-y-6">
      <AdminBar title="ページビュー分析" />
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">ページビュー分析（過去7日間）</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">パス</th>
                <th className="text-right p-3">総PV</th>
                <th className="text-right p-3">平均PV/日</th>
              </tr>
            </thead>
            <tbody>
              {sortedPaths.map((stat, index) => (
                <tr key={stat.path} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 font-mono text-sm">{stat.path}</td>
                  <td className="p-3 text-right">{stat.totalViews.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    {Math.round(stat.totalViews / stat.days).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedPaths.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            データがありません
          </div>
        )}
      </div>
    </div>
  );
}
