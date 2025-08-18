"use client";

import { ReactNode, useEffect, useState } from "react";

interface DemoGuardProps {
  children: ReactNode;
  destructive?: boolean;
  tooltip?: string;
}

type FeatureFlags = {
  demoGuardEnabled: boolean;
};

export default function DemoGuard({ children, destructive = false, tooltip }: DemoGuardProps) {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlags() {
      try {
        const res = await fetch("/api/flags");
        if (res.ok) {
          const data = await res.json();
          setFlags(data);
        }
      } catch (error) {
        console.error("Failed to load flags:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFlags();
  }, []);

  if (loading) {
    return <>{children}</>;
  }

  const isBlocked = flags?.demoGuardEnabled && destructive;

  if (isBlocked) {
    return (
      <div className="relative group">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        {tooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {tooltip}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
