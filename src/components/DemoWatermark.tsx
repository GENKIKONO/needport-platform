"use client";

import { useEffect, useState } from "react";

export default function DemoWatermark() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === "true");
  }, []);

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
        DEMO
      </div>
    </div>
  );
}
