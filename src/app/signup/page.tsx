export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import SignupClient from "./SignupClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SignupClient />
    </Suspense>
  );
}
