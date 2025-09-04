"use client";
import { useEffect } from "react";

export default function RUMTracker({ markId="v2_start", measureId="v2_visible" }:{
  markId?: string; measureId?: string;
}) {
  useEffect(() => {
    try { performance.mark(markId); } catch {}
    return () => { try { performance.measure(measureId, markId); } catch {} };
  }, [markId, measureId]);
  return null;
}
