"use client";
import useSWR from "swr";

type Props = { userId?: string | null };

export default function TrustBadge({ userId }: Props) {
  if (!userId) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">—</span>;

  const { data } = useSWR(`/api/trust/users/${userId}`, (url) => fetch(url, { credentials: "include" }).then(r => r.json()));

  const level = data?.score?.bands as "high" | "mid" | "low" | undefined;
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    high: { bg: "bg-emerald-100", fg: "text-emerald-700", label: "HIGH" },
    mid:  { bg: "bg-amber-100",   fg: "text-amber-700",   label: "MID"  },
    low:  { bg: "bg-rose-100",    fg: "text-rose-700",    label: "LOW"  },
  };

  const sty = level ? map[level] : { bg: "bg-gray-100", fg: "text-gray-600", label: "…"};
  const score = data?.score?.value ?? undefined;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${sty.bg} ${sty.fg}`} title={score ? `Score: ${score}` : undefined}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {sty.label}{typeof score === "number" ? ` ${score}` : ""}
    </span>
  );
}
