import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    const { data: needs, error } = await supabase
      .from("needs")
      .select(`
        id,
        title,
        summary,
        created_at,
        updated_at,
        adopted_offer_id,
        prejoin_count,
        status,
        tags,
        location,
        price_amount,
        min_people,
        deadline,
        recruitment_closed
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create CSV content
    const headers = [
      "ID",
      "タイトル",
      "概要",
      "作成日時",
      "更新日時",
      "採用オファーID",
      "賛同数",
      "ステータス",
      "タグ",
      "エリア",
      "価格",
      "最低人数",
      "締切",
      "募集終了"
    ];

    const csvRows = [
      headers.join(","),
      ...(needs || []).map(need => [
        need.id,
        `"${(need.title || "").replace(/"/g, '""')}"`,
        `"${(need.summary || "").replace(/"/g, '""')}"`,
        need.created_at,
        need.updated_at,
        need.adopted_offer_id || "",
        need.prejoin_count || 0,
        need.status || "",
        `"${(need.tags || []).join(";")}"`,
        `"${(need.location || "").replace(/"/g, '""')}"`,
        need.price_amount || "",
        need.min_people || "",
        need.deadline || "",
        need.recruitment_closed ? "true" : "false"
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM
    const fullContent = bom + csvContent;

    return new NextResponse(fullContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="needs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
