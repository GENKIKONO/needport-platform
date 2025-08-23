import FlowDiagram from '@/components/overview/FlowDiagram';
import InterestLevels from '@/components/overview/InterestLevels';
import PermissionsTable from '@/components/overview/PermissionsTable';
import KaichuLifecycle from '@/components/overview/KaichuLifecycle';
import FutureBenefits from '@/components/overview/FutureBenefits';

export const metadata = {
  title: 'サービスの流れと仕組み | NeedPort',
};

export default function ServiceOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--c-blue-strong)]">サービスの流れと仕組み</h1>
        <p className="text-[var(--c-text-muted)] text-sm">関心の3段階・海中の仕組み・ユーザー権限まで一目で分かるガイドです。</p>
      </header>
      <FlowDiagram />
      <InterestLevels />
      <PermissionsTable />
      <KaichuLifecycle />
      <FutureBenefits />
    </div>
  );
}
