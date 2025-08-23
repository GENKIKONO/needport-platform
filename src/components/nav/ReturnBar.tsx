"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getLastListHref() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("lastListHref");
}

function setLastListHref(href: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("lastListHref", href);
}

export function TrackListContext() {
  const pathname = usePathname();
  const search = useSearchParams();
  const isList = useMemo(() => {
    return pathname?.startsWith("/needs") && !/\/needs\/[^/]+/.test(pathname || "");
  }, [pathname]);
  
  useEffect(() => {
    if (isList) {
      const href = `${pathname}${search?.toString() ? "?" + search!.toString() : ""}`;
      setLastListHref(href);
    }
  }, [isList, pathname, search]);
  
  return null;
}

export default function ReturnBar({ fallback = "/needs" }: { fallback?: string }) {
  const [href, setHref] = useState<string | null>(null);
  
  useEffect(() => {
    setHref(getLastListHref());
  }, []);
  
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[var(--c-border)]">
      <div className="mx-auto max-w-5xl px-4 py-2 flex items-center justify-between">
        <div className="text-sm text-[var(--c-text-muted)]">
          <span className="hidden sm:inline">一覧に戻る: </span>
          <Link href={href || fallback} className="text-[var(--c-blue)] hover:underline">
            {href || fallback}
          </Link>
        </div>
        <button 
          onClick={() => history.length > 1 ? history.back() : (window.location.href = href || fallback)}
          className="text-sm text-[var(--c-blue)] hover:underline"
        >
          ← 前のページへ
        </button>
      </div>
    </div>
  );
}
