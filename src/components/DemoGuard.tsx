"use client";

import { ReactNode } from "react";

interface DemoGuardProps {
  children: ReactNode;
  destructive?: boolean;
  tooltip?: string;
}

export default function DemoGuard({ children, destructive = false, tooltip }: DemoGuardProps) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (isDemoMode && destructive) {
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
