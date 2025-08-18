"use client";
import { useState, useEffect } from "react";
import { KpiCards } from "@/components/admin/KpiCards";
import { type AdminStats } from "@/lib/admin/types";
import { yen, timeAgo } from "@/lib/admin/format";
import TrustBadge from "@/components/admin/TrustBadge";

export default function AdminHome() {
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
      <p className="mt-2 text-neutral-600">骨組みOK。今後KPI/一覧/操作を載せます。</p>
      
      {/* Trustバッジ凡例 */}
      <div className="mt-4 text-sm text-neutral-600 flex items-center gap-4">
        <span className="inline-flex items-center gap-2">
          <TrustBadge userId="demo_high" />
          <span>High ≥ 70</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <TrustBadge userId="demo_mid" />
          <span>Mid 40–69</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <TrustBadge userId="demo_low" />
          <span>Low &lt; 40</span>
        </span>
      </div>
    </main>
  );
}
