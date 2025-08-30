'use client'
import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import LeftDock from "@/components/nav/LeftDock"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
      {/* 左上ロゴ */}
      <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600">
        <span>🌀 NeedPort</span>
      </Link>

      {/* モバイル用ハンバーガー */}
      <button
        className="lg:hidden p-2"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* モバイル時のサイドナビ */}
      {open && (
        <div className="absolute top-12 left-0 w-64 h-screen bg-white shadow-lg z-50">
          <LeftDock />
        </div>
      )}
    </header>
  )
}
