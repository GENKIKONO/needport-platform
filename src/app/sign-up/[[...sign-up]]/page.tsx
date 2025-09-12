import { SignUp } from '@clerk/nextjs';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { BRAND } from '@/lib/constants/brand';
import { CLERK_CONFIG } from '@/lib/constants/clerk';

export default function Page() {
  return (
    <AuthPageLayout 
      title="NeedPortに登録"
      subtitle={BRAND.MESSAGES.SIGNUP_SUBTITLE}
    >
      <SignUp 
        appearance={CLERK_CONFIG.appearance}
        routing="path"
        path="/sign-up"
        redirectUrl={CLERK_CONFIG.redirectUrl}
      />
    </AuthPageLayout>
  );
}
