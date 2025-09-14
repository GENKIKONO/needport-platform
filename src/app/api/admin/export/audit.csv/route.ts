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
    
    const { data: auditLogs, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        user_id,
        created_at,
        profiles!inner(
          clerk_user_id
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10000); // Limit to prevent memory issues

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create CSV content
    const headers = [
      "ID",
      "アクション",
      "テーブル名",
      "レコードID",
      "変更前",
      "変更後",
      "ユーザーID",
      "作成日時"
    ];

    const csvRows = [
      headers.join(","),
      ...(auditLogs || []).map(log => [
        log.id,
        log.action || "",
        log.table_name || "",
        log.record_id || "",
        `"${(JSON.stringify(log.old_values) || "").replace(/"/g, '""')}"`,
        `"${(JSON.stringify(log.new_values) || "").replace(/"/g, '""')}"`,
        log.user_id || "",
        log.created_at
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM
    const fullContent = bom + csvContent;

    return new NextResponse(fullContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
