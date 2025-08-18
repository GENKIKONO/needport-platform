"use client";
import { useState, useEffect } from "react";
import { KpiCards } from "@/components/admin/KpiCards";
import { type AdminStats } from "@/lib/admin/types";
import { yen, timeAgo } from "@/lib/admin/format";

export default function AdminHome() {
  return (
    <main className="container py-10">
      <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
      <p className="mt-2 text-neutral-600">骨組みOK。今後KPI/一覧/操作を載せます。</p>
    </main>
  );
}
