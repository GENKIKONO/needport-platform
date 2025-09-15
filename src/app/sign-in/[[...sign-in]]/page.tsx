'use client';

import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { BRAND } from '@/lib/constants/brand';
import { CLERK_CONFIG } from '@/lib/constants/clerk';

export default function Page() {
  return (
    <AuthPageLayout 
      title="NeedPortにログイン"
      subtitle={BRAND.MESSAGES.LOGIN_SUBTITLE}
    >
      <ClerkLoading>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn 
          appearance={CLERK_CONFIG.appearance}
          routing="path"
          path="/sign-in"
          redirectUrl={CLERK_CONFIG.redirectUrl}
        />
      </ClerkLoaded>
    </AuthPageLayout>
  );
}
