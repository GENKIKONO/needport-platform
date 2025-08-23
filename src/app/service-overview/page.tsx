import FlowDiagram from '@/components/overview/FlowDiagram';
import InterestLevels from '@/components/overview/InterestLevels';
import PermissionsTable from '@/components/overview/PermissionsTable';
import KaichuLifecycle from '@/components/overview/KaichuLifecycle';
import FutureBenefits from '@/components/overview/FutureBenefits';
import Wave from '@/components/decoration/Wave';

export const metadata = {
  title: 'サービスの流れと仕組み | NeedPort',
};

export default function ServiceOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-[var(--blue-700,#196AA6)] text-white">
        <img 
          src="/images/port-hero.jpg" 
          alt="" 
          className="absolute inset-0 h-full w-full object-cover opacity-30" 
        />
        <div className="relative px-6 py-16 lg:px-10 lg:py-24">
          <h1 className="text-3xl lg:text-4xl font-bold">サービスの流れと仕組み</h1>
          <p className="mt-3 max-w-3xl text-white/90">
            欲しい声が港に集まり、共感の波で事業が動き出す。NeedPortは「集まる→響く→形になる」を支える港です。
          </p>
        </div>
        <Wave position="bottom" />
      </section>

      {/* Content Sections */}
      <FlowDiagram />
      <InterestLevels />
      <PermissionsTable />
      <KaichuLifecycle />
      <FutureBenefits />
    </div>
  );
}
