import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: RBAC with Clerk
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");
  const expectedToken = process.env.ADMIN_ACCESS_TOKEN;
  
  if (!expectedToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-4">管理者アクセス未設定</h1>
          <p className="text-gray-600 mb-4">
            ADMIN_ACCESS_TOKEN が設定されていません。
          </p>
          <p className="text-sm text-gray-500">
            .env.local に ADMIN_ACCESS_TOKEN=your-token を追加してください。
          </p>
        </div>
      </div>
    );
  }
  
  if (!adminToken || adminToken.value !== expectedToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-4">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">
            管理者権限が必要です。
          </p>
          <p className="text-sm text-gray-500">
            /admin?t=your-token でアクセスしてください。
          </p>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
