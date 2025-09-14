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
    
    const { data: offers, error } = await supabase
      .from("offers")
      .select(`
        id,
        need_id,
        vendor_name,
        amount,
        created_at,
        updated_at,
        needs!inner(
          title
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
      "提供者名",
      "金額",
      "作成日時",
      "更新日時"
    ];

    const csvRows = [
      headers.join(","),
      ...(offers || []).map(offer => [
        offer.id,
        offer.need_id,
        `"${(offer.needs?.title || "").replace(/"/g, '""')}"`,
        `"${(offer.vendor_name || "").replace(/"/g, '""')}"`,
        offer.amount || "",
        offer.created_at,
        offer.updated_at
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM
    const fullContent = bom + csvContent;

    return new NextResponse(fullContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="offers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
