import "@/styles/tokens.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // NOTE: アプリ側もサイドナビを出さない（ルートレイアウトで既に描画済み）
  return <main className="min-h-dvh">{children}</main>;
}
