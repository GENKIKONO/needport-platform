import { IS_DEV, HAS_CLERK } from "@/app/(ui2)/_lib/env-guard";
export const dynamic = (!HAS_CLERK && IS_DEV) ? "force-dynamic" : "auto";
export const metadata = { title: "マイページ – NeedPort" };
export default function Me(){
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-2">マイページ</h1>
      <p className="text-slate-600">このページはプレースホルダーです（認証導線のみ）。</p>
    </div>
  );
}
