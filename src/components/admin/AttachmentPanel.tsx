"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface Attachment {
  id: string;
  file_name: string;
  size: number;
  content_type: string;
  created_at: string;
  downloadUrl?: string;
}

export default function AttachmentPanel({ needId }: { needId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadAttachments();
  }, [needId]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attachments?needId=${needId}`);
      const data = await res.json();
      
      if (res.ok) {
        setAttachments(data.attachments || []);
      } else {
        toast.error("添付ファイルの読み込みに失敗しました");
      }
    } catch (error) {
      toast.error("添付ファイルの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("needId", needId);

      const res = await fetch("/api/admin/attachments", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("ファイルをアップロードしました");
        loadAttachments(); // Reload list
      } else {
        toast.error(data.message || "アップロードに失敗しました");
      }
    } catch (error) {
      toast.error("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="rounded-lg border border-white/10 p-4">
      <h3 className="text-lg font-medium mb-4">添付ファイル</h3>
      
      {/* Upload Form */}
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-emerald-600/20 file:text-emerald-200
            hover:file:bg-emerald-600/30
            disabled:opacity-50"
        />
        {uploading && <p className="text-sm text-gray-400 mt-2">アップロード中...</p>}
      </div>

      {/* Attachments List */}
      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 rounded bg-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(attachment.size)} • {new Date(attachment.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
              {attachment.downloadUrl && (
                <a
                  href={attachment.downloadUrl}
                  download={attachment.file_name}
                  className="ml-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  ダウンロード
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">添付ファイルはありません</p>
      )}
    </div>
  );
}
