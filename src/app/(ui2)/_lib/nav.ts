"use client";
import { usePathname } from "next/navigation";

export function useActive(path: string, exact=false){
  const p = usePathname() || "/";
  if (exact) return p === path;
  return p === path || (p.startsWith(path.endsWith("/")? path : path + "/"));
}
