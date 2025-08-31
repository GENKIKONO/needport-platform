export const dynamic = "force-dynamic";
export default function UI2Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
}
