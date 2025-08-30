'use client';
import { useCallback, useState } from 'react';

export default function UploadDrop({ onFiles }: { onFiles: (f: File[]) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFiles(Array.from(e.target.files));
  }, [onFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) onFiles(Array.from(e.dataTransfer.files));
  }, [onFiles]);

  return (
    <label 
      className={`block cursor-pointer rounded border-2 border-dashed p-6 text-center transition-colors ${
        isDragOver 
          ? 'border-[var(--c-blue)] bg-[var(--c-blue-bg)]' 
          : 'border-[var(--c-border)] hover:border-[var(--c-blue)] hover:bg-[var(--c-blue-bg)]'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="text-sm text-[var(--c-text-muted)]">
        {isDragOver ? 'ここにドロップしてください' : '画像/資料をドラッグ&ドロップ、またはクリックして選択'}
      </div>
      <input type="file" multiple className="hidden" onChange={onChange} />
    </label>
  );
}
