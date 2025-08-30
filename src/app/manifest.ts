export default function manifest() {
  return {
    name: "NeedPort - ニーズとオファーをつなぐプラットフォーム",
    short_name: "NeedPort",
    description: "地域のニーズと事業者をマッチングするプラットフォーム",
    icons: [
      { src: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    theme_color: "#196AA6",
    background_color: "#FFFFFF",
    display: "standalone",
    start_url: "/",
    scope: "/",
  };
}
