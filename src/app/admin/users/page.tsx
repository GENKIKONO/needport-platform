"use client";
import useSWR from "swr";

export default function AdminUsersPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/users", (u) => fetch(u, { credentials:"include" }).then(r=>r.json()));
  const rows = data?.rows ?? [];

  const endorse = async (userId: string) => {
    await fetch("/api/trust/endorse", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, weight: 1 })
    });
    mutate();
  };

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Users</h1>
      {isLoading ? <div>Loading…</div> : (
        <div className="overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Referrer</th>
                <th className="px-3 py-2 text-left">Score</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{u.id}</td>
                  <td className="px-3 py-2">{u.email ?? "—"}</td>
                  <td className="px-3 py-2">{u.referrerId ?? "—"}</td>
                  <td className="px-3 py-2">{u.trust?.value ?? 0} ({u.trust?.bands ?? "—"})</td>
                  <td className="px-3 py-2">
                    <button onClick={()=>endorse(u.id)} className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700">
                      推薦 +1
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={5}>No users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
