import LeftDock from "@/components/nav/LeftDock";
import MobileHeader from "@/components/chrome/MobileHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[300px,1fr]">
      <LeftDock /> {/* hidden on mobile */}
      <div className="lg:col-start-2">
        <MobileHeader /> {/* lg:hidden */}
        <main className="px-4 lg:px-8 pt-4 lg:pt-6 pb-[96px]">
          {children}
        </main>
      </div>
    </div>
  );
}
