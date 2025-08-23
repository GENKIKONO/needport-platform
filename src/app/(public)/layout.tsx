import LeftDock from "@/components/nav/LeftDock";
import MobileHeader from "@/components/chrome/MobileHeader";
import BottomNav from "@/components/BottomNav";
import MktFooter from "@/mkt/components/MktFooter";

export default function PublicLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MobileHeader />
      <div className="lg:grid lg:grid-cols-[300px,1fr] lg:gap-0 flex-1">
        <LeftDock />
        <main className="min-h-dvh pt-[var(--header-mobile)] lg:pt-0 pb-[var(--safe-bottom)] lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <MktFooter />
    </div>
  );
}
