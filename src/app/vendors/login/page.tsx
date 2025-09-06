// src/app/vendors/login/page.tsx
'use client';
import { SignIn } from '@clerk/clerk-react';

export default function VendorLogin() {
  return (
    <div className="mx-auto max-w-md p-6">
      <SignIn routing="path" path="/vendors/login" afterSignInUrl="/vendors" />
    </div>
  );
}
