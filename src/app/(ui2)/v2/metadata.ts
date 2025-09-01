import type { Metadata } from "next";
import { title, desc, canonical } from "@/lib/seo/meta";

export const metadata: Metadata = {
  title: title(),
  description: desc(),
  alternates: { canonical: canonical("/v2") },
  openGraph: { title: title(), description: desc(), type: "website" },
  twitter: { card: "summary_large_image" }
};
