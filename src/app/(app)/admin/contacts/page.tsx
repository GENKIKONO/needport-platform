import { currentUser } from '@clerk/nextjs/server';

async function fetchContacts() {
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/admin/contacts`, { cache:'no-store', headers:{'x-needport-internal':'1'} });
  if (!res.ok) return [];
  return res.json();
}

export const dynamic = 'force-dynamic';
export default async function AdminContacts() {
  const user = await currentUser();
  if (!user) return <div className="p-6">ログインが必要です。</div>;
  const rows = await fetchContacts();
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">お問い合わせ一覧</h1>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="p-2">日時</th><th className="p-2">名前</th><th className="p-2">メール</th><th className="p-2">件名</th><th className="p-2">本文</th></tr>
          </thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.name ?? '-'}</td>
                <td className="p-2 break-all">{r.email ?? '-'}</td>
                <td className="p-2">{r.subject ?? '-'}</td>
                <td className="p-2 max-w-[520px] truncate" title={r.body}>{r.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
