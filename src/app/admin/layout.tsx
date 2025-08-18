import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = { title: '管理ダッシュボード' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const c = cookies().get('admin_token')?.value;
  const token = process.env.ADMIN_ACCESS_TOKEN;

  if (!c || !token || c !== token) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">403 Forbidden</h1>
        <p className="mt-2 text-sm text-neutral-600">
          /admin/login-token?t=＜トークン＞ でログインしてください。
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
