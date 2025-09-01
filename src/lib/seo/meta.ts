export const SITE = {
  name: "NeedPort（ニードポート）",
  url: process.env.NEXT_PUBLIC_ROOT_DOMAIN ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : "https://needport.jp",
  twitter: "@needport_jp"
};

export function title(t?: string) {
  return t ? `${t} | ${SITE.name}` : SITE.name;
}
export function desc(d?: string) {
  return d || "匿名で条件を合わせてから顔合わせ。ニッチなニーズを束ね、事業者とフラットにマッチングするプラットフォーム。";
}
export function canonical(path: string) {
  const base = SITE.url.replace(/\/+$/,"");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
