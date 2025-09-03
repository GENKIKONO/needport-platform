import { headers } from "next/headers";
import VendorsList from "./_parts/VendorsList";
export const dynamic = "force-static";
export const revalidate = 60;

function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max, n)); }

export default async function Page({ searchParams }: { searchParams?: any }) {
  const h = headers(); h.set("Cache-Control","public, s-maxage=60, stale-while-revalidate=120");
  const sp = searchParams || {};
  const page = clamp(Number(sp.page||1), 1, 200);
  const size = clamp(Number(sp.size||20), 1, 50);
  const cat  = String(sp.cat||"").slice(0,80);
  const area = String(sp.area||"").slice(0,80);
  return <div className="container-page py-6"><VendorsList page={page} size={size} cat={cat} area={area} /></div>;
}
