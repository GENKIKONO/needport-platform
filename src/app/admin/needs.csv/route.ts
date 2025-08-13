export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/csv";
import { SCALE_LABEL, type NeedScale } from "@/lib/domain/need";

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data: needs, error } = await admin
      .from("needs")
      .select(`
        id,
        title,
        created_at,
        adopted_offer_id,
        min_people,
        deadline,
        scale,
        macro_fee_hint,
        macro_use_freq,
        macro_area_hint,
        entries(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return new NextResponse("Failed to fetch needs", { status: 500 });
    }

    const needsList = needs || [];

    // Transform data to include total people count
    const transformedNeeds = needsList.map(need => ({
      ...need,
      total_people: need.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0,
      is_adopted: need.adopted_offer_id ? "採用済み" : "未採用",
      scale_label: SCALE_LABEL[(need.scale as NeedScale) || 'personal'],
    }));

    const csv = toCsv(transformedNeeds, [
      { key: "id", label: "ID" },
      { key: "title", label: "タイトル" },
      { key: "created_at", label: "作成日時" },
      { key: "is_adopted", label: "採用状況" },
      { key: "scale_label", label: "種類" },
      { key: "macro_fee_hint", label: "会費目安" },
      { key: "macro_use_freq", label: "利用頻度" },
      { key: "macro_area_hint", label: "対象エリア" },
      { key: "min_people", label: "最低人数" },
      { key: "deadline", label: "締切" },
      { key: "total_people", label: "応募人数" },
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="needs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
