"use client";

import { useState, useEffect } from "react";
import AdminBar from "@/components/admin/AdminBar";

interface BackupFile {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

interface BackupFolder {
  name: string;
  date: string;
  files: BackupFile[];
  totalSize: number;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBackup, setRunningBackup] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/backups");
      
      if (!response.ok) {
        throw new Error("Failed to fetch backups");
      }
      
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error("Error fetching backups:", error);
      setMessage({
        type: "error",
        text: "バックアップ一覧の取得に失敗しました。"
      });
    } finally {
      setLoading(false);
    }
  };

  const runBackup = async () => {
    try {
      setRunningBackup(true);
      setMessage(null);
      
      const response = await fetch("/api/admin/backup/run", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Backup failed");
      }
      
      const result = await response.json();
      
      setMessage({
        type: "success",
        text: `バックアップが完了しました。${result.total_records}件のレコードが保存されました。`
      });
      
      // Refresh the backup list
      setTimeout(() => {
        fetchBackups();
      }, 1000);
      
    } catch (error) {
      console.error("Backup error:", error);
      setMessage({
        type: "error",
        text: "バックアップの実行に失敗しました。"
      });
    } finally {
      setRunningBackup(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(`/api/admin/backups/download?path=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error("Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download error:", error);
      setMessage({
        type: "error",
        text: "ファイルのダウンロードに失敗しました。"
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("ja-JP");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">バックアップ管理</h1>
            <p className="text-gray-400">
              データベースのバックアップファイルを管理します。
            </p>
          </div>
          
          <button
            onClick={runBackup}
            disabled={runningBackup}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-medium"
          >
            {runningBackup ? "バックアップ実行中..." : "手動バックアップ実行"}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-900/20 border border-green-500/40 text-green-300"
              : "bg-red-900/20 border border-red-500/40 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Backup List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-4 text-gray-400">バックアップ一覧を読み込み中...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">バックアップがありません</h3>
            <p className="text-gray-400">
              手動バックアップを実行するか、自動バックアップを待ってください。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {backups.map((backup) => (
              <div key={backup.name} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{backup.date}</h3>
                    <p className="text-gray-400">
                      {backup.files.length}個のファイル • {formatFileSize(backup.totalSize)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(backup.files[0]?.created_at || "")}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {backup.files.map((file) => (
                    <div key={file.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate flex-1">
                          {file.name}
                        </h4>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatFileSize(file.metadata.size)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadFile(`${backup.name}/${file.name}`, file.name)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs text-white"
                        >
                          ダウンロード
                        </button>
                        
                        {file.name.endsWith('.json') && (
                          <button
                            onClick={() => downloadFile(`${backup.name}/${file.name}`, file.name)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs text-white"
                            title="JSON形式でダウンロード"
                          >
                            JSON
                          </button>
                        )}
                        
                        {file.name.endsWith('.csv') && (
                          <button
                            onClick={() => downloadFile(`${backup.name}/${file.name}`, file.name)}
                            className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-xs text-white"
                            title="CSV形式でダウンロード"
                          >
                            CSV
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Information */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/40 rounded-lg p-6">
          <h3 className="font-medium text-blue-300 mb-3">バックアップについて</h3>
          <div className="text-sm text-blue-200 space-y-2">
            <p>• 自動バックアップは毎日午前3時に実行されます</p>
            <p>• バックアップは30日間保存されます</p>
            <p>• CSVとJSONの両形式で保存されます</p>
            <p>• バックアップファイルは暗号化されて保存されます</p>
          </div>
        </div>
      </div>
    </div>
  );
}
