'use client';

// src/components/nav/LeftDock.tsx
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface LeftDockProps {
  onItemClick?: () => void;
}

export default function LeftDock({ onItemClick }: LeftDockProps) {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="text-sm space-y-6">
      {/* 認証エリア */}
      <section>
        <div className="px-3 pb-2 text-xs font-medium text-blue-600/80 uppercase tracking-wide">アカウント</div>
        <ul className="space-y-1">
          {isSignedIn ? (
            <li>
              <Link
                href="/me"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium"
                onClick={onItemClick}
                data-testid="me-link"
              >
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="プロフィール写真" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <span>マイページ（{user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'ユーザー'}）</span>
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  href="/sign-in"
                  className="block px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium text-center"
                  onClick={onItemClick}
                  data-testid="signin-link"
                >
                  一般ログイン
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors/login"
                  className="block px-3 py-2 rounded-xl bg-slate-600 text-white hover:bg-slate-700 transition-all duration-200 font-medium text-center"
                  onClick={onItemClick}
                  data-testid="vendor-signin-link"
                >
                  事業者ログイン
                </Link>
              </li>
            </>
          )}
        </ul>
      </section>

      {/* 基本機能 */}
      <section>
        <div className="px-3 pb-2 text-xs font-medium text-blue-600/80 uppercase tracking-wide">基本機能</div>
        <ul className="space-y-1">
          <li>
            <Link
              href="/needs/new"
              className="block px-3 py-2 rounded-xl hover:bg-blue-50/50 text-slate-700 hover:text-blue-600/80 transition-all duration-200 font-medium"
              onClick={onItemClick}
            >
              ニーズを投稿する
            </Link>
          </li>
          <li>
            <Link
              href="/needs"
              className="block px-3 py-2 rounded-xl hover:bg-blue-50/50 text-slate-700 hover:text-blue-600/80 transition-all duration-200 font-medium"
              onClick={onItemClick}
            >
              ニーズ一覧
            </Link>
          </li>
        </ul>
      </section>

      {/* その他 */}
      <section>
        <div className="px-3 pb-2 text-xs font-medium text-blue-600/80 uppercase tracking-wide">その他</div>
        <ul className="space-y-1">
          <li>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-xl hover:bg-blue-50/50 text-slate-700 hover:text-blue-600/80 transition-all duration-200 font-medium"
              onClick={onItemClick}
            >
              サービスについて
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="block px-3 py-2 rounded-xl hover:bg-blue-50/50 text-slate-700 hover:text-blue-600/80 transition-all duration-200 font-medium"
              onClick={onItemClick}
            >
              利用規約
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="block px-3 py-2 rounded-xl hover:bg-blue-50/50 text-slate-700 hover:text-blue-600/80 transition-all duration-200 font-medium"
              onClick={onItemClick}
            >
              プライバシーポリシー
            </Link>
          </li>
        </ul>
      </section>
    </nav>
  );
}