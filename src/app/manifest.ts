export default function manifest() {
  return {
    name: "NeedPort",
    short_name: "NeedPort",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    theme_color: "#0F4DB6",
    background_color: "#FFFFFF",
    display: "standalone",
  };
}
