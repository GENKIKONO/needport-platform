export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import AdminBar from "@/components/admin/AdminBar";
import NeedEditForm from "@/components/admin/NeedEditForm";

export default async function NeedEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: need, error } = await supabase
      .from("needs")
      .select("id, title, min_people, deadline, recruitment_closed")
      .eq("id", id)
      .single();

    if (error) {
      return (
        <div className="p-6 text-red-500">
          ニーズが見つかりませんでした。
          <pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
        </div>
      );
    }

    if (!need) {
      return (
        <div className="p-6 text-red-500">
          ニーズが見つかりませんでした。
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <AdminBar title="ニーズ編集" />
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">ニーズ編集</h1>
          <NeedEditForm need={need} />
        </div>
      </div>
    );
  } catch (e: any) {
    return (
      <div className="p-6 text-red-500">
        予期せぬエラーが発生しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{e?.message ?? String(e)}</pre>
      </div>
    );
  }
}
