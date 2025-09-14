import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { headers } from "next/headers";

// Helper function to convert data to CSV

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = String(value || "").replace(/"/g, '""');
        return escaped.includes(",") || escaped.includes("\n") ? `"${escaped}"` : escaped;
      }).join(",")
    )
  ];
  
  return csvRows.join("\n");
}

// Helper function to create UTF-8 BOM
function createUTF8BOM(): Buffer {
  return Buffer.from([0xEF, 0xBB, 0xBF]);
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const backupFolder = `backups/${today}`;
    
    const backupResults: Record<string, { csv: number; json: number }> = {};
    
    // Tables to backup
    const tables = ["needs", "offers", "prejoins", "consents", "audit_logs"];
    
    for (const tableName of tables) {
      try {
        // Fetch data from table
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          continue;
        }
        
        const records = data || [];
        backupResults[tableName] = { csv: 0, json: 0 };
        
        if (records.length > 0) {
          // Create CSV
          const csvContent = arrayToCSV(records);
          const csvBuffer = Buffer.concat([
            createUTF8BOM(),
            Buffer.from(csvContent, "utf8")
          ]);
          
          // Create JSON
          const jsonContent = JSON.stringify(records, null, 2);
          const jsonBuffer = Buffer.from(jsonContent, "utf8");
          
          // Upload to storage
          const csvPath = `${backupFolder}/${tableName}.csv`;
          const jsonPath = `${backupFolder}/${tableName}.json`;
          
          const { error: csvError } = await supabase.storage
            .from("attachments")
            .upload(csvPath, csvBuffer, {
              contentType: "text/csv",
              upsert: true
            });
          
          const { error: jsonError } = await supabase.storage
            .from("attachments")
            .upload(jsonPath, jsonBuffer, {
              contentType: "application/json",
              upsert: true
            });
          
          if (!csvError) {
            backupResults[tableName].csv = records.length;
          }
          
          if (!jsonError) {
            backupResults[tableName].json = records.length;
          }
          
          if (csvError) {
            console.error(`Error uploading CSV for ${tableName}:`, csvError);
          }
          
          if (jsonError) {
            console.error(`Error uploading JSON for ${tableName}:`, jsonError);
          }
        }
        
      } catch (tableError) {
        console.error(`Error processing table ${tableName}:`, tableError);
      }
    }
    
    // Create backup metadata
    const backupMetadata = {
      backup_date: today,
      timestamp: new Date().toISOString(),
      tables: backupResults,
      total_records: Object.values(backupResults).reduce(
        (sum, result) => sum + result.csv + result.json, 
        0
      )
    };
    
    // Upload metadata
    const metadataPath = `${backupFolder}/backup-metadata.json`;
    const metadataBuffer = Buffer.from(JSON.stringify(backupMetadata, null, 2), "utf8");
    
    await supabase.storage
      .from("attachments")
      .upload(metadataPath, metadataBuffer, {
        contentType: "application/json",
        upsert: true
      });
    
    return NextResponse.json({
      success: true,
      message: "Backup completed successfully",
      backup_date: today,
      results: backupResults,
      total_records: backupMetadata.total_records
    });
    
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Backup failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
