import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/csv";
import archiver from "archiver";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Get need data
    const { data: need, error: needError } = await admin
      .from("needs")
      .select("*")
      .eq("id", id)
      .single();

    if (needError || !need) {
      return new NextResponse("Need not found", { status: 404 });
    }

    // Get offers
    const { data: offers } = await admin
      .from("offers")
      .select("*")
      .eq("need_id", id)
      .order("amount", { ascending: true });

    // Get entries (prejoins)
    const { data: entries } = await admin
      .from("entries")
      .select("*")
      .eq("need_id", id)
      .order("created_at", { ascending: false });

    // Create ZIP stream
    const archive = archiver("zip", {
      zlib: { level: 9 } // Maximum compression
    });

    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        
        archive.on("end", () => {
          controller.close();
        });
        
        archive.on("error", (err) => {
          controller.error(err);
        });
      }
    });

    // Add files to archive
    archive.append(JSON.stringify(need, null, 2), { name: "need.json" });

    if (offers && offers.length > 0) {
      const offersCsv = toCsv(offers, [
        { key: "id", label: "ID" },
        { key: "vendor_name", label: "提供者" },
        { key: "amount", label: "金額" },
        { key: "created_at", label: "作成日時" },
      ]);
      archive.append(offersCsv, { name: "offers.csv" });
    }

    if (entries && entries.length > 0) {
      const entriesCsv = toCsv(entries, [
        { key: "id", label: "ID" },
        { key: "name", label: "名前" },
        { key: "email", label: "メールアドレス" },
        { key: "count", label: "参加人数" },
        { key: "note", label: "備考" },
        { key: "created_at", label: "作成日時" },
      ]);
      archive.append(entriesCsv, { name: "entries.csv" });
    }

    // Create summary text
    const summary = `
NeedPort エクスポートサマリー
============================

募集情報:
- ID: ${need.id}
- タイトル: ${need.title}
- 作成日: ${new Date(need.created_at).toLocaleDateString("ja-JP")}
- 最低人数: ${need.min_people || "未設定"}
- 締切: ${need.deadline || "未設定"}
- 採用オファーID: ${need.adopted_offer_id || "なし"}
- 募集終了: ${need.recruitment_closed ? "はい" : "いいえ"}

統計:
- オファー数: ${offers?.length || 0}
- 応募数: ${entries?.length || 0}
- 総参加人数: ${entries?.reduce((sum, e) => sum + e.count, 0) || 0}

エクスポート日時: ${new Date().toLocaleString("ja-JP")}
    `.trim();

    archive.append(summary, { name: "summary.txt" });

    // Finalize archive
    archive.finalize();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="need-${id}.zip"`,
      },
    });

  } catch (error: any) {
    console.error("ZIP export error:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
