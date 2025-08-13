import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: need } = await supabase
      .from("needs")
      .select(`
        title,
        adopted_offer_id,
        min_people,
        entries(count)
      `)
      .eq("id", id)
      .single();

    if (!need) {
      return new ImageResponse(
        (
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              width: "1200",
              height: "630",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "system-ui",
            }}
          >
            <h1 style={{ fontSize: "48px", margin: "0 0 20px 0" }}>
              募集が見つかりません
            </h1>
            <p style={{ fontSize: "24px", opacity: 0.8 }}>NeedPort</p>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const totalPeople = need.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0;
    const progress = need.min_people ? Math.min((totalPeople / need.min_people) * 100, 100) : 0;

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            width: "1200",
            height: "630",
            display: "flex",
            flexDirection: "column",
            padding: "60px",
            color: "white",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                marginRight: "20px",
              }}
            >
              NP
            </div>
            <h1 style={{ fontSize: "32px", margin: 0, fontWeight: "bold" }}>NeedPort</h1>
          </div>

          <h2
            style={{
              fontSize: "48px",
              margin: "0 0 30px 0",
              lineHeight: 1.2,
              fontWeight: "bold",
            }}
          >
            {need.title}
          </h2>

          {need.adopted_offer_id && (
            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#10b981",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                採用済み
              </div>
            </div>
          )}

          {need.min_people && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", marginRight: "20px" }}>
                  進捗: {totalPeople} / {need.min_people} 人
                </span>
                <span style={{ fontSize: "20px", opacity: 0.8 }}>
                  ({Math.round(progress)}%)
                </span>
              </div>
              <div
                style={{
                  width: "400px",
                  height: "12px",
                  background: "#374151",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: "auto", opacity: 0.7 }}>
            <p style={{ fontSize: "20px", margin: 0 }}>
              {need.adopted_offer_id ? "この募集に参加する" : "この募集を確認する"}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "1200",
            height: "630",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "system-ui",
          }}
        >
          <h1 style={{ fontSize: "48px", margin: "0 0 20px 0" }}>
            エラーが発生しました
          </h1>
          <p style={{ fontSize: "24px", opacity: 0.8 }}>NeedPort</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
