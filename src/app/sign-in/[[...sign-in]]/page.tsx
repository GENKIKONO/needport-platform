import { SignIn } from '@clerk/nextjs';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { BRAND } from '@/lib/constants/brand';
import { CLERK_CONFIG } from '@/lib/constants/clerk';

export default function Page() {
  return (
    <AuthPageLayout 
      title="NeedPortにログイン"
      subtitle={BRAND.MESSAGES.LOGIN_SUBTITLE}
    >
      <SignIn 
        appearance={CLERK_CONFIG.appearance}
        routing="path"
        path="/sign-in"
        redirectUrl={CLERK_CONFIG.redirectUrl}
      />
    </AuthPageLayout>
  );
}
