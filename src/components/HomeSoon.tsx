import Link from "next/link";
import { getNeedsSafe } from "@/lib/demo/data";

export default async function HomeSoon() {
  const needs = await getNeedsSafe();
  const hot = needs.filter(n => (n.progress ?? 0) >= 0.8).slice(0, 3);
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {hot.map(n => (
        <article key={n.id} className="np-card p-6">
          <header className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-900">{n.title}</h3>
            <span className="np-badge bg-red-100 text-red-600">
              あと{Math.max(1, Math.ceil((n.target ?? 10) - (n.count ?? 0)))}人
            </span>
          </header>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{n.description}</p>
          <div className="mb-4">
            <div className="np-progress bg-gray-200">
              <div 
                className="h-full bg-brand-600" 
                style={{ width: `${Math.min(100, Math.round((n.progress ?? 0) * 100))}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-right text-gray-500">
              {Math.round((n.progress ?? 0) * 100)}%
            </div>
          </div>
          <Link href={`/needs/${n.id}`} className="btn btn-primary w-full">
            いますぐ賛同する
          </Link>
        </article>
      ))}
    </div>
  );
}
