import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { supabaseServer } from "./supabase";

interface ConsentParams {
  subject: string;
  refId?: string;
  req: NextRequest;
}

export async function logConsent({ subject, refId, req }: ConsentParams) {
  try {
    const supabase = supabaseServer();
    
    // Get IP address from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";
    
    // Get user agent
    const ua = req.headers.get("user-agent") || "unknown";
    
    // Create IP hash with daily salt for privacy
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const ipHash = createHash("sha256")
      .update(`${ip}:${today}:${process.env.CONSENT_SALT || "default-salt"}`)
      .digest("hex");
    
    // Insert consent record
    const { error } = await supabase
      .from("consents")
      .insert({
        subject,
        ref_id: refId,
        ip_hash: ipHash,
        ua,
      });
    
    if (error) {
      console.error("Failed to log consent:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in logConsent:", error);
    return { success: false, error: "Internal error" };
  }
}

export async function getConsentsBySubject(subject: string, limit = 100) {
  try {
    const supabase = supabaseServer();
    
    const { data, error } = await supabase
      .from("consents")
      .select("*")
      .eq("subject", subject)
      .order("at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Failed to fetch consents:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error in getConsentsBySubject:", error);
    return { success: false, error: "Internal error" };
  }
}
