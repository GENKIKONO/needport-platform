import { NextResponse } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { setSettings } from "@/lib/server/settings";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body || typeof body !== "object") {
      return jsonError("Invalid request body");
    }
    
    // Validate that all values are strings
    const entries: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        entries[key] = value;
      } else {
        entries[key] = String(value);
      }
    }
    
    await setSettings(entries);
    
    return jsonOk({ message: "Settings saved successfully" });
    
  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to save settings", 500);
  }
}
