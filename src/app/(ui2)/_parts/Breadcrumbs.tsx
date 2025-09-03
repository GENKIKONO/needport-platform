"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs(){
  const p = (usePathname() || "/").replace(/\/+$/,"");
  const chunks = p.split("/").filter(Boolean);
  const acc: string[] = [];
  return (
    <nav aria-label="パンくず" className="text-sm text-slate-600 mb-3">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/v2" className="hover:text-sky-700">ホーム</Link></li>
        {chunks.map((c,i)=>{
          acc.push("/"+chunks.slice(0,i+1).join("/"));
          const href = acc[acc.length-1];
          if (href==="/v2") return null;
          const label = decodeURIComponent(c);
          return (
            <li key={href} className="flex items-center gap-1">
              <span>/</span>
              {i===chunks.length-1 ? <span aria-current="page" className="font-semibold">{label}</span>
                : <Link href={href} className="hover:text-sky-700">{label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
