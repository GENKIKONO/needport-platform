import "@/styles/tokens.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // NOTE: 公開側はサイドナビを出さない（重複防止）
  return <main className="min-h-dvh">{children}</main>;
}
