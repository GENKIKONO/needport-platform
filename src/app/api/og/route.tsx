import { ImageResponse } from "next/og";
export const runtime = "edge";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const t = searchParams.get("t") || "NeedPort";
  return new ImageResponse(
    (
      <div style={{ background: "#0f172a", color: "white", width: "100%", height: "100%", display:"flex", padding:"64px", alignItems:"flex-end", fontSize: 56 }}>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 28, opacity:.8, marginBottom: 8 }}>埋もれた声を、つなぐ。形にする。</div>
          <div style={{ fontWeight: 700 }}>{t}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
