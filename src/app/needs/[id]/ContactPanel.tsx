"use client";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

export function ContactPanel({ needId }: { needId: string }) {
  const { data, error } = useSWR(`/api/needs/${needId}/contact`, fetcher);
  const [show, setShow] = useState(false);

  if (error && error.status !== 403) return null;
  if (!data || data.error === "not_unlocked") return null;

  return (
    <div className="mt-4">
      {show ? (
        <div className="rounded border p-3 bg-white/60">
          <div className="text-sm">メール: {data.contact.email}</div>
          <div className="text-sm mt-1">電話: {data.contact.phone}</div>
        </div>
      ) : (
        <button className="text-blue-600 underline" onClick={()=>setShow(true)}>
          連絡先を表示
        </button>
      )}
    </div>
  );
}
