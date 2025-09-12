import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">NeedPortに登録</h1>
          <p className="text-slate-600 mb-4">高知県民のためのニーズマッチングプラットフォーム</p>
          <p className="text-sm text-slate-500">アカウントを作成して、ニーズや提案を管理しましょう</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-sm normal-case',
              card: 'shadow-lg border border-blue-100/50',
              headerTitle: 'text-slate-800',
              headerSubtitle: 'text-slate-600'
            }
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="/me"
        />
      </div>
    </div>
  );
}
