"use client";
export const fetcher = async (url: string) => {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    const text = await r.text().catch(()=> "");
    throw new Error(`HTTP ${r.status}${text ? `: ${text.slice(0,160)}` : ""}`);
  }
  return r.json();
};
