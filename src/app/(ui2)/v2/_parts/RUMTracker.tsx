"use client";
import { useEffect } from "react";
import { mark, measure } from "@/app/(ui2)/_lib/rum";

export default function RUMTracker() {
  useEffect(() => {
    mark("v2_start");
    return () => {
      measure("v2_visible", "v2_start");
    };
  }, []);
  
  return null; // このコンポーネントは表示されません
}
