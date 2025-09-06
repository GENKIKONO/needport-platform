// src/app/login/page.tsx
'use client';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="mx-auto max-w-md p-6">
      <SignIn routing="path" path="/login" afterSignInUrl="/me" />
    </div>
  );
}
