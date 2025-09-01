"use client";
import useSWR from "swr";
const fetcher = (u:string)=> fetch(u).then(r=>r.json());

export default function RCCheck(){
  const ready = useSWR("/api/ready", fetcher, { refreshInterval: 8000, revalidateOnFocus:false });
  const needs = useSWR("/api/needs/list?per=3", fetcher);
  const vendors = useSWR("/api/vendors?per=3", fetcher);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Release Candidate チェック</h1>
      <section className="rounded border bg-white p-4">
        <div className="font-medium">Ready</div>
        <pre className="mt-2 text-xs overflow-auto bg-slate-50 p-2 rounded">{JSON.stringify(ready.data || {}, null, 2)}</pre>
      </section>
      <section className="rounded border bg-white p-4">
        <div className="font-medium">Needs サンプル</div>
        <pre className="mt-2 text-xs overflow-auto bg-slate-50 p-2 rounded">{JSON.stringify(needs.data || {}, null, 2)}</pre>
      </section>
      <section className="rounded border bg-white p-4">
        <div className="font-medium">Vendors サンプル</div>
        <pre className="mt-2 text-xs overflow-auto bg-slate-50 p-2 rounded">{JSON.stringify(vendors.data || {}, null, 2)}</pre>
      </section>
      <p className="text-xs text-slate-500">※ ここは公開前の人手チェック用ページです。問題がなければ削除/認証保護してください。</p>
    </div>
  );
}
