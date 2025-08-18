import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('admin_token')?.value;
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  const ok = token && expected && token === expected;

  if (!ok) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">403 Forbidden</h1>
        <p className="mt-2 text-sm text-gray-600">
          /admin/login-token?t=YOUR_TOKEN にアクセスしてから再読込してください。
        </p>
      </main>
    );
  }
  return <>{children}</>;
}
