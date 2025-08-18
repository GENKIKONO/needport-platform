export const runtime = "edge";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { id: string } }) {
  try {
    // ニーズデータを取得
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/needs`);
    const data = await res.json();
    const need = data.items?.find((n: any) => n.id === params.id);
    
    if (!need) {
      return new ImageResponse(
        (
          <div style={{ 
            width: "1200px", 
            height: "630px", 
            background: "linear-gradient(135deg,#0ea5e9,#2563eb 55%,#0ea5e9)",
            color: "#fff",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 48, 
            fontWeight: 600 
          }}>
            ニーズが見つかりません
          </div>
        ), 
        size
      );
    }

    return new ImageResponse(
      (
        <div style={{ 
          width: "1200px", 
          height: "630px", 
          background: "linear-gradient(135deg,#0ea5e9,#2563eb 55%,#0ea5e9)",
          color: "#fff",
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          padding: "60px"
        }}>
          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
            {need.title}
          </div>
          <div style={{ fontSize: 24, opacity: 0.9, marginBottom: 30, textAlign: "center" }}>
            賛同 {need.supportsCount || 0}人 / 10人で出港
          </div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>
            NeedPort
          </div>
        </div>
      ), 
      size
    );
  } catch (error) {
    return new ImageResponse(
      (
        <div style={{ 
          width: "1200px", 
          height: "630px", 
          background: "linear-gradient(135deg,#0ea5e9,#2563eb 55%,#0ea5e9)",
          color: "#fff",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: 48, 
          fontWeight: 600 
        }}>
          NeedPort
        </div>
      ), 
      size
    );
  }
}
