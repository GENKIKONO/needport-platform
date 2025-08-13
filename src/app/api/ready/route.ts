import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSmtpConfigured } from "@/lib/mail/smtp";

interface HealthCheck {
  name: string;
  status: "ok" | "error" | "warning";
  message: string;
  details?: any;
}

async function readyHandler(req: NextRequest) {
  const errorId = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().toISOString();

  try {
    // Check admin authentication
    const adminPin = req.cookies.get('admin_pin')?.value;
    if (adminPin !== process.env.ADMIN_PIN) {
      return NextResponse.json({
        status: "error",
        errorId,
        timestamp,
        message: "Admin authentication required"
      }, { status: 401 });
    }

    const checks: HealthCheck[] = [];
    let overallStatus = "ok";

    // Database check
    try {
      const supabase = createAdminClient();
      const startTime = Date.now();
      const { data, error } = await supabase.from("needs").select("count", { count: "exact", head: true });
      const responseTime = Date.now() - startTime;

      if (error) {
        checks.push({
          name: "Database",
          status: "error",
          message: "Database connection failed",
          details: { error: error.message }
        });
        overallStatus = "error";
      } else {
        checks.push({
          name: "Database",
          status: "ok",
          message: "Database connection successful",
          details: { responseTime: `${responseTime}ms` }
        });
      }
    } catch (error) {
      checks.push({
        name: "Database",
        status: "error",
        message: "Database connection failed",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      });
      overallStatus = "error";
    }

    // Storage check
    try {
      const supabase = createAdminClient();
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        checks.push({
          name: "Storage",
          status: "error",
          message: "Storage access failed",
          details: { error: error.message }
        });
        overallStatus = "error";
      } else {
        const attachmentsBucket = buckets?.find(bucket => bucket.name === "attachments");
        if (attachmentsBucket) {
          checks.push({
            name: "Storage",
            status: "ok",
            message: "Storage bucket 'attachments' exists",
            details: { bucketName: attachmentsBucket.name, public: attachmentsBucket.public }
          });
        } else {
          checks.push({
            name: "Storage",
            status: "warning",
            message: "Storage bucket 'attachments' not found",
            details: { availableBuckets: buckets?.map(b => b.name) || [] }
          });
          if (overallStatus === "ok") overallStatus = "warning";
        }
      }
    } catch (error) {
      checks.push({
        name: "Storage",
        status: "error",
        message: "Storage check failed",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      });
      overallStatus = "error";
    }

    // Mail configuration check
    const smtpConfigured = isSmtpConfigured();
    if (smtpConfigured) {
      checks.push({
        name: "Mail",
        status: "ok",
        message: "SMTP configuration detected",
        details: { 
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          from: process.env.MAIL_FROM,
          toOwner: process.env.MAIL_TO_OWNER ? "configured" : "missing"
        }
      });
    } else {
      checks.push({
        name: "Mail",
        status: "warning",
        message: "SMTP not configured (using fallback)",
        details: { 
          host: process.env.SMTP_HOST || "not set",
          fallback: "localhost:1025"
        }
      });
      if (overallStatus === "ok") overallStatus = "warning";
    }

    // Feature flags check
    const flags = {
      stripe: process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true",
      pwa: process.env.NEXT_PUBLIC_PWA_ENABLED === "true",
      demo: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
      maintenance: process.env.FF_MAINTENANCE === "true",
    };

    checks.push({
      name: "Feature Flags",
      status: "ok",
      message: "Feature flags loaded",
      details: flags
    });

    return NextResponse.json({
      status: overallStatus,
      timestamp,
      service: "needport-api",
      version: process.env.NEXT_PUBLIC_BUILD_SHA || "unknown",
      checks
    });

  } catch (error) {
    // Don't expose stack traces in production
    console.error(`Ready check error [${errorId}]:`, error);
    
    return NextResponse.json({
      status: "error",
      errorId,
      timestamp,
      service: "needport-api",
      message: "Internal server error"
    }, { status: 500 });
  }
}

export const GET = readyHandler;
