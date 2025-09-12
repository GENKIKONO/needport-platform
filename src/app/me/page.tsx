import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MePage(){
  const { userId } = auth();
  const user = await currentUser();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30">
      <div className="mx-auto max-w-4xl p-6 space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">マイページ</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {userId ? (
              <>こんにちは、{user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'ユーザー'}さん<br />
              あなたの活動を管理できます。</>
            ) : (
              <>ログインしてあなたのニーズや提案を管理しましょう<br />
              アカウントを作成すると、より多くの機能をご利用いただけます。</>
            )}
          </p>
        </div>

        {!userId && (
          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/90 text-white font-semibold rounded-full hover:bg-blue-600/90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ログイン
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-800">投稿したニーズ</h3>
            </div>
            <p className="text-slate-600 mb-4">あなたが投稿したニーズを管理できます</p>
            <Link 
              href="/needs/new" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/90 text-white hover:bg-blue-600/90 transition-all duration-300 shadow-sm"
            >
              新規投稿
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-800">提案した案件</h3>
            </div>
            <p className="text-slate-600 mb-4">あなたが提案した案件の状況を確認できます</p>
            <Link 
              href="/me/proposals" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100/60 text-slate-700 hover:bg-blue-50/50 transition-all duration-300"
            >
              提案履歴
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-800">事業者向け</h3>
            </div>
            <p className="text-slate-600 mb-4">事業者としての機能とガイド</p>
            <Link 
              href="/me/vendor/guide" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100/60 text-slate-700 hover:bg-blue-50/50 transition-all duration-300"
            >
              提案ガイド
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-800">アカウント設定</h3>
            </div>
            <p className="text-slate-600 mb-4">プロフィールや通知設定を変更</p>
            <Link 
              href="/me/settings" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100/60 text-slate-700 hover:bg-blue-50/50 transition-all duration-300"
            >
              設定
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}