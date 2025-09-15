'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';

export default function AuthMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSignedIn) {
    return (
      <>
        <Link href="/sign-in" className="bg-blue-600 text-white px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
          一般ログイン
        </Link>
        <Link href="/vendors/login" className="bg-slate-600 text-white px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-700 transition-colors">
          事業者ログイン
        </Link>
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* マイページボタン（ドロップダウントリガー） */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        {user?.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt="プロフィール写真" 
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <span className="hidden sm:inline">マイページ</span>
        <span className="hidden lg:inline">（{user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'ユーザー'}）</span>
        
        {/* ドロップダウン矢印 */}
        <svg 
          className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <Link
            href="/me"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              マイページ
            </div>
          </Link>
          
          <div className="border-t border-gray-200 my-1"></div>
          
          <SignOutButton>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ログアウト
              </div>
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}