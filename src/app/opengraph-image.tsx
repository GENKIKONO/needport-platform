export const runtime = "edge";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
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
        fontSize: 72, 
        fontWeight: 700 
      }}>
        NeedPort
      </div>
    ), 
    size
  );
}
