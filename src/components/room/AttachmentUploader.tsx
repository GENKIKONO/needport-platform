"use client";

import { useState, useRef } from "react";

interface Attachment {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  signedUrl: string | null;
}

interface AttachmentUploaderProps {
  roomId: string;
  onUploadSuccess?: (attachment: Attachment) => void;
  onUploadError?: (error: string) => void;
}

export default function AttachmentUploader({ 
  roomId, 
  onUploadSuccess, 
  onUploadError 
}: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing attachments
  useState(() => {
    fetchAttachments();
  });

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${roomId}/attachments`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch attachments");
      }
      
      const data = await response.json();
      setAttachments(data.attachments || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/rooms/${roomId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      
      // Add to attachments list
      setAttachments(prev => [data.attachment, ...prev]);
      
      // Call success callback
      onUploadSuccess?.(data.attachment);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileClick = async (attachment: Attachment) => {
    if (!attachment.signedUrl) {
      console.error("No signed URL available");
      return;
    }

    try {
      // Fetch the file content
      const response = await fetch(attachment.signedUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab or download
      if (attachment.mimeType === 'application/pdf') {
        window.open(url, '_blank');
      } else {
        // For images, open in new tab
        window.open(url, '_blank');
      }
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    return '📎';
  };

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return '画像';
    return 'ファイル';
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              アップロード中...
            </>
          ) : (
            <>
              📎 ファイルを選択
            </>
          )}
        </button>
        
        <p className="text-sm text-gray-500 mt-2">
          PDF, PNG, JPG (最大10MB)
        </p>
      </div>

      {/* Attachments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium text-lg">添付ファイル</h3>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              onClick={() => handleFileClick(attachment)}
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <div className="text-2xl mr-3">
                {getFileIcon(attachment.mimeType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {attachment.originalName}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{getFileTypeLabel(attachment.mimeType)}</span>
                  <span>{formatFileSize(attachment.fileSize)}</span>
                  <span>
                    {new Date(attachment.uploadedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📎</div>
          <p>添付ファイルがありません</p>
        </div>
      )}
    </div>
  );
}
