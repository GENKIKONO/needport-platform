"use client";
import { useEffect, useState } from "react";
import { RequireAccountModal } from "./RequireAccountModal";

export default function LockedActionGuard({
  children,
  flagsRequireAccount, // flags.requireAccountForEngagement
}: { children: (enabled: boolean, openModal: () => void) => React.ReactNode; flagsRequireAccount: boolean; }) {
  const [uid, setUid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined") {
      const c = document.cookie.split("; ").find(v => v.startsWith("uid="))?.split("=")[1] ?? null;
      setUid(c);
    }
  }, []);
  const enabled = !flagsRequireAccount || !!uid;
  return (
    <>
      {children(enabled, () => setOpen(true))}
      <RequireAccountModal open={!enabled && open} onClose={() => setOpen(false)} />
    </>
  );
}
