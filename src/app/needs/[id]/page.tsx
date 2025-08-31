import { notFound } from 'next/navigation';
import { getNeedById } from '@/lib/server/needsService';
import ProposalButton from '@/components/needs/ProposalButton';
import { UnlockAccessButton } from "@/components/needs/UnlockAccessButton";
import { ContactPanel } from "./ContactPanel";

interface NeedDetailPageProps {
  params: { id: string };
}

export default async function NeedDetailPage({ params }: NeedDetailPageProps) {
  // データを取得
  const need = await getNeedById(params.id);

  if (!need) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{need.title}</h1>
        <div className="text-xs text-muted-foreground">
          {new Date(need.updated_at || need.created_at).toLocaleDateString()} / {need.area} / {need.category}
        </div>
      </header>

      <section className="rounded border p-4 space-y-2">
        <h2 className="font-medium">概要</h2>
        <p className="whitespace-pre-line">{need.summary}</p>
      </section>

      {need.deadline && (
        <div className="text-sm">
          <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">
            期限: {new Date(need.deadline).toLocaleDateString()}
          </span>
        </div>
      )}

      <UnlockAccessButton needId={need.id}/>

      <aside className="pt-4">
        <h2 className="font-medium mb-2">関連するニーズ</h2>
        <div className="text-sm text-muted-foreground">※ 検索条件に基づき、後日実装予定</div>
      </aside>
    </div>
  );
}
