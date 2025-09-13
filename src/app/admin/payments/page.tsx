import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PaymentManagementTable } from "@/components/admin/PaymentManagementTable";

export const metadata: Metadata = {
  title: "決済管理 (Lv1) | Admin | NeedPort",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false }
  }
};

/**
 * Admin Payment Management Page (Lv1: Manual operator-led)
 * 
 * Features:
 * - List held transactions
 * - Manual release/refund actions
 * - Audit logging
 * - No automatic processing
 */
export default async function AdminPaymentsPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">決済管理 (Lv1)</h1>
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            ⚠️ 運営主導返金 - 自動処理は行われません
          </div>
        </div>
        <p className="text-slate-600">
          held状態の取引を手動で解放・返金します。すべての操作は監査ログに記録されます。
        </p>
      </div>

      <PaymentManagementTable />
      
      <div className="text-center mt-8">
        <a 
          href="/admin" 
          className="text-sky-700 hover:text-sky-800 underline text-sm"
        >
          ← 管理ダッシュボードに戻る
        </a>
      </div>
    </div>
  );
}