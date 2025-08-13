import { fetchNeedById } from "@/lib/server/queries";
import PublishToggle from "@/components/admin/PublishToggle";
import { SCALE_LABEL, isCommunity, type NeedScale } from "@/lib/domain/need";

export const dynamic = "force-dynamic";

export default async function OpsPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const need = await fetchNeedById(id);

  if (!need) {
    return (
      <div className="p-6">該当の案件が見つかりませんでした（ID: {id}）。</div>
    );
  }

  const prejoinCount = (need as any).prejoin_count ?? 0;
  const minPeople =
    (need as any).min_people ??
    (need as any).min ??
    0;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">運営オペレーション</h1>
      
      <div className="rounded-lg border p-4 bg-card">
        <div className="font-medium">{need.title}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
            {SCALE_LABEL[((need as any).scale as NeedScale) || 'personal']}
          </span>
          <div className="text-sm text-muted-foreground">
            賛同: {prejoinCount} 名 / 最低 {minPeople} 名
          </div>
        </div>
        
        {/* Community hints block */}
        {isCommunity((need as any).scale) && ((need as any).macro_fee_hint || (need as any).macro_use_freq || (need as any).macro_area_hint) && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <div className="font-medium mb-1">メモ</div>
            {(need as any).macro_fee_hint && (
              <div>会費目安: {(need as any).macro_fee_hint}</div>
            )}
            {(need as any).macro_use_freq && (
              <div>利用頻度: {(need as any).macro_use_freq}</div>
            )}
            {(need as any).macro_area_hint && (
              <div>対象エリア: {(need as any).macro_area_hint}</div>
            )}
          </div>
        )}
      </div>

      <PublishToggle needId={id} isPublished={need.published ?? false} />

      {/* ここに既存のLINE用テキスト/メール送信などのUIをそのまま配置してOK */}
    </div>
  );
}
