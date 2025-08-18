import Link from "next/link";
import { type AdminStats } from "@/lib/admin/types";
import { yen } from "@/lib/admin/format";

export function KpiCards({ stats }: { stats: AdminStats }) {
  const totalNeeds = Object.values(stats.byStage).reduce((a, b) => a + b, 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Link href="/admin/needs" className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
        <div className="text-sm font-medium text-gray-600">総件数</div>
        <div className="text-2xl font-bold text-gray-900">{totalNeeds}</div>
      </Link>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-600">総額</div>
        <div className="text-2xl font-bold text-gray-900">{yen(stats.grossYen)}</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-600">平均チケット</div>
        <div className="text-2xl font-bold text-gray-900">{yen(stats.avgTicketYen)}</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-600">総賛同数</div>
        <div className="text-2xl font-bold text-blue-600">{stats.totalSupports ?? 0}</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-600">平均賛同/案件</div>
        <div className="text-2xl font-bold text-blue-600">
          {totalNeeds > 0 ? Math.round((stats.totalSupports ?? 0) / totalNeeds * 10) / 10 : 0}
        </div>
      </div>
      
      <Link href="/admin/needs?stage=proposed" className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
        <div className="text-sm font-medium text-gray-600">承認待ち</div>
        <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
      </Link>
    </div>
  );
}
