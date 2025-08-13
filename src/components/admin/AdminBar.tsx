"use client";
import { useRouter } from "next/navigation";

export default function AdminBar(props: { title?: string }) {
  const r = useRouter();
  return (
    <div className="sticky top-0 z-40 mb-4 flex items-center gap-3 border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur">
      <button onClick={() => r.back()} className="text-sm opacity-80 hover:underline">戻る</button>
      <div className="mx-2 h-4 w-px bg-white/10" />
      <div className="text-sm font-medium">{props.title ?? "Admin"}</div>
      <div className="ml-auto flex items-center gap-4">
        <a href="/admin/logs" className="text-sm text-gray-400 hover:text-white">
          監査ログ
        </a>
      </div>
      <form action="/api/admin/logout" method="post">
        <button className="text-sm opacity-80 hover:underline">ログアウト</button>
      </form>
    </div>
  );
}
