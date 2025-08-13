import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // List all files in the backups folder
    const { data: files, error } = await supabase.storage
      .from("attachments")
      .list("backups", {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" }
      });
    
    if (error) {
      console.error("Error listing backup files:", error);
      return NextResponse.json(
        { error: "Failed to list backup files" },
        { status: 500 }
      );
    }
    
    // Group files by date folder
    const backupFolders: Record<string, any[]> = {};
    
    files?.forEach(file => {
      if (file.name && file.name.includes("/")) {
        const [folderName, fileName] = file.name.split("/", 2);
        if (!backupFolders[folderName]) {
          backupFolders[folderName] = [];
        }
        backupFolders[folderName].push({
          ...file,
          name: fileName
        });
      }
    });
    
    // Convert to array and sort by date (newest first)
    const backups = Object.entries(backupFolders)
      .map(([folderName, files]) => {
        const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
        return {
          name: folderName,
          date: folderName.replace("backups/", ""),
          files: files.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
          totalSize
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Keep only last 30 days
    
    return NextResponse.json({
      backups,
      total_folders: backups.length,
      total_files: backups.reduce((sum, backup) => sum + backup.files.length, 0)
    });
    
  } catch (error) {
    console.error("Error in backup listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
