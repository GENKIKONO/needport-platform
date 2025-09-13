"use client";
import { SignOutButton } from "@clerk/nextjs";

export function AccountSection() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">アカウント</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-3">
            アカウントからログアウトします。再度ログインするまでマイページにアクセスできなくなります。
          </p>
          <SignOutButton
            signOutOptions={{ 
              sessionId: undefined,
              redirectUrl: "/" 
            }}
          >
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium hover:bg-red-100 hover:border-red-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ログアウト
            </button>
          </SignOutButton>
        </div>
      </div>
    </section>
  );
}