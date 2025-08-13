import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data: prejoins, error } = await supabase
      .from("prejoins")
      .select(`
        id,
        need_id,
        user_id,
        status,
        created_at,
        updated_at,
        needs!inner(
          title
        ),
        profiles!inner(
          clerk_user_id
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create CSV content
    const headers = [
      "ID",
      "ニーズID",
      "ニーズタイトル",
      "ユーザーID",
      "ステータス",
      "作成日時",
      "更新日時"
    ];

    const csvRows = [
      headers.join(","),
      ...(prejoins || []).map(prejoin => [
        prejoin.id,
        prejoin.need_id,
        `"${(prejoin.needs?.title || "").replace(/"/g, '""')}"`,
        prejoin.user_id || "",
        prejoin.status || "",
        prejoin.created_at,
        prejoin.updated_at
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM
    const fullContent = bom + csvContent;

    return new NextResponse(fullContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="prejoins-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
