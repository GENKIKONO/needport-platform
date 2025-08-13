export const dynamic = "force-dynamic";

import { getAllSettings } from "@/lib/server/settings";
import AdminBar from "@/components/admin/AdminBar";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  try {
    const settings = await getAllSettings();
    
    return (
      <div className="space-y-6">
        <AdminBar title="設定" />
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">システム設定</h1>
          <SettingsForm initialSettings={settings} />
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-6 text-red-500">
        設定の読み込みに失敗しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{error?.message ?? String(error)}</pre>
      </div>
    );
  }
}
