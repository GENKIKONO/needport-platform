import { NextResponse } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { FF_NOTIFICATIONS } from "@/lib/flags";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if notifications are enabled
    if (!FF_NOTIFICATIONS) {
      return jsonError("Notifications feature is disabled", 503, {
        reason: "flag disabled"
      });
    }

    // Check for Resend configuration
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Try to get account info (dry run)
        await resend.domains.list();
        
        return jsonOk({ 
          ok: true, 
          provider: "resend",
          from: process.env.RESEND_FROM || "noreply@needport.com"
        });
      } catch (error: any) {
        return jsonError("Resend configuration error", 503, {
          provider: "resend",
          error: error?.message || "Unknown error"
        });
      }
    }

    // Check for SMTP configuration
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Verify connection with timeout
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("SMTP verification timeout")), 3000)
        );

        await Promise.race([verifyPromise, timeoutPromise]);

        return jsonOk({ 
          ok: true, 
          provider: "smtp",
          host: process.env.SMTP_HOST,
          from: process.env.SMTP_FROM || process.env.SMTP_USER
        });
      } catch (error: any) {
        return jsonError("SMTP configuration error", 503, {
          provider: "smtp",
          error: error?.message || "Unknown error"
        });
      }
    }

    // No mail provider configured
    return jsonError("No mail provider configured", 503, {
      reason: "no provider",
      error: "Set RESEND_API_KEY or SMTP_* environment variables"
    });

  } catch (error: any) {
    return jsonError("Health check failed", 500, {
      error: error?.message || "Unknown error"
    });
  }
}
