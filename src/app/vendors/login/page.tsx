import { SignIn } from '@clerk/nextjs';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { BRAND } from '@/lib/constants/brand';
import { CLERK_CONFIG } from '@/lib/constants/clerk';

export default function VendorLoginPage() {
  return (
    <AuthPageLayout 
      title="事業者ログイン"
      subtitle="事業者としてログインして、ニーズへの提案や案件管理を行いましょう"
    >
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">事業者向けログイン</h3>
            <p className="text-sm text-green-700 mt-1">
              事業者として登録済みの方はこちらからログインしてください。<br/>
              まだ事業者登録がお済みでない方は、
              <a href="/vendors/register" className="underline font-medium">こちら</a>
              から登録をお願いします。
            </p>
          </div>
        </div>
      </div>
      <SignIn 
        appearance={{
          ...CLERK_CONFIG.appearance,
          elements: {
            ...CLERK_CONFIG.appearance.elements,
            formButtonPrimary: 'bg-green-500 hover:bg-green-600 text-sm normal-case',
          }
        }}
        routing="path"
        path="/vendors/login"
        redirectUrl="/me/vendor"
      />
    </AuthPageLayout>
  );
}
