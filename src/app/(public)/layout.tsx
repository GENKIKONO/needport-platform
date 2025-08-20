import LeftDock from "@/components/nav/LeftDock";
import MobileHeader from "@/components/chrome/MobileHeader";
import BottomNav from "@/components/BottomNav";

export default function PublicLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <MobileHeader />
      <div className="lg:grid lg:grid-cols-[300px,1fr] lg:gap-0">
        <LeftDock />
        <main className="min-h-dvh pt-[var(--header-mobile)] lg:pt-0 pb-[var(--safe-bottom)] lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
