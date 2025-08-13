import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "NeedPort",
    short_name: "NeedPort",
    description: "ニーズとオファーをつなぐプラットフォーム",
    theme_color: "#111827",
    background_color: "#111827",
    display: "standalone",
    start_url: "/",
    scope: "/",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["business", "productivity"],
    lang: "ja",
    dir: "ltr"
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
