'use client'
import Header from "./Header"
import LeftDock from "@/components/nav/LeftDock"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左サイドナビ (PC時のみ) */}
      <aside className="hidden lg:flex">
        <LeftDock />
      </aside>

      {/* メイン領域 */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
