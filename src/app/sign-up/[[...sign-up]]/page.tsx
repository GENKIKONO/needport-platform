'use client';

import { SignUp, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { BRAND } from '@/lib/constants/brand';
import { CLERK_CONFIG } from '@/lib/constants/clerk';

export default function Page() {
  return (
    <AuthPageLayout 
      title="NeedPortに登録"
      subtitle={BRAND.MESSAGES.SIGNUP_SUBTITLE}
    >
      <ClerkLoading>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp 
          appearance={CLERK_CONFIG.appearance}
          routing="path"
          path="/sign-up"
          redirectUrl={CLERK_CONFIG.redirectUrl}
        />
      </ClerkLoaded>
    </AuthPageLayout>
  );
}
