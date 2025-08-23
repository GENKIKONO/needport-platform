'use client';
import { events } from '@/lib/events';
import { getDevSession } from '@/lib/devAuth';

export default function PermissionsTable() {
  const devSession = getDevSession();
  events.serviceOverview.view(devSession?.userId || 'anonymous', 'permissions');
  
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--c-blue-strong)]">ユーザーごとの権限</h2>
      <div className="overflow-x-auto rounded-md border border-[var(--c-border)]">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-[var(--c-blue-bg)] text-[var(--c-blue-strong)]">
            <tr>
              <th className="p-2 text-left">ユーザー種別</th>
              <th className="p-2">投稿</th>
              <th className="p-2">購入したい</th>
              <th className="p-2">欲しいかも</th>
              <th className="p-2">興味あり</th>
              <th className="p-2">提案投稿</th>
              <th className="p-2">海中アクセス</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['未登録ユーザー', '×','×','×','✅','×','×'],
              ['登録ユーザー（一般）', '✅','✅','✅','✅','×','✅'],
              ['登録ユーザー（企業）', '✅','✅','✅','✅','✅','✅'],
            ].map((row, i) => (
              <tr key={i} className="odd:bg-[var(--c-card)] even:bg-[var(--c-bg)]">
                <td className="p-2 font-medium text-[var(--c-text)]">{row[0]}</td>
                {row.slice(1).map((cell, j) => (
                  <td key={j} className="p-2 text-center text-[var(--c-text)]">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
