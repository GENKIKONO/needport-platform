"use client";
import { useMemo, useState } from "react";
import LockIcon from "@/components/icons/Lock";
import UsersIcon from "@/components/icons/Users";

type RoomStatus = "closed" | "pending" | "open";

export default function NeedRoomPanel({ defaultStatus="closed" }:{ defaultStatus?: RoomStatus }) {
  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const isAdmin = url?.searchParams.get("admin") === "1";
  const [status, setStatus] = useState<RoomStatus>(defaultStatus);
  const [joined, setJoined] = useState(false);

  const badge = useMemo(() => {
    const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border";
    if (status === "closed") return <span className={`${base} border-neutral-300 text-neutral-600`}><LockIcon/>未開設</span>;
    if (status === "pending") return <span className={`${base} border-amber-300 text-amber-700`}>申請中</span>;
    return <span className={`${base} border-sky-300 text-sky-700`}>開設済み</span>;
  }, [status]);

  return (
    <section className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-sky-600"/><span>承認制ルーム</span>
        </h3>
        <div className="flex items-center gap-3">
          {badge}
          {isAdmin && (
            <select
              value={status}
              onChange={(e)=>setStatus(e.target.value as RoomStatus)}
              className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
              aria-label="ルーム状態"
            >
              <option value="closed">closed</option>
              <option value="pending">pending</option>
              <option value="open">open</option>
            </select>
          )}
        </div>
      </div>

      {/* 内容 */}
      {status === "closed" && (
        <div className="mt-3">
          <p className="text-sm text-neutral-600">
            このニーズのルームはまだ開設されていません。運営が内容確認後に開設されます。
          </p>
          <div className="mt-3">
            <button className="rounded-lg bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800">
              開設を申請
            </button>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div className="mt-3">
          <p className="text-sm text-neutral-600">
            開設申請を受け付けました。運営の承認後、参加できるようになります。
          </p>
        </div>
      )}

      {status === "open" && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            {[0,1,2].map(i=>(
              <div key={i} className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200" aria-hidden/>
            ))}
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            関係者だけの安全なスペースで進行管理を行います。
          </p>
          <div className="mt-3 flex gap-2">
            {joined ? (
              <button className="rounded-lg bg-sky-600 text-white px-4 py-2 hover:bg-sky-700">ルームに入る</button>
            ) : (
              <button onClick={()=>setJoined(true)} className="rounded-lg border border-sky-300 text-sky-700 px-4 py-2 hover:bg-sky-50">参加を申請</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
