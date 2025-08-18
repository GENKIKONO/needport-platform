"use client";
import { useState, useEffect } from "react";
import { KpiCards } from "@/components/admin/KpiCards";
import { type AdminStats } from "@/lib/admin/types";
import { yen, timeAgo } from "@/lib/admin/format";

export default function AdminHome() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard (Skeleton)</h1>
      <p className="mt-2 text-gray-600">
        ログインできています。この後、一覧やKPIなど本体を足していけます。
      </p>
    </main>
  );
}
