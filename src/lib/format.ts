// Number formatter for Japanese locale
export const nf = new Intl.NumberFormat("ja-JP");

// Date formatter
export function formatDate(d?: string | Date): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

// Money formatter
export function formatMoney(n?: number): string {
  return nf.format(n ?? 0) + " 円";
}
