import { NeedsTable } from "@/components/admin/NeedsTable";

export default function AdminNeedsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ニーズ一覧</h1>
      <NeedsTable />
    </div>
  );
}
