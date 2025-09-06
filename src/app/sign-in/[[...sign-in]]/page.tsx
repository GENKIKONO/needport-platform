// /sign-in → Clerk SignIn に委譲
"use client";
import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
