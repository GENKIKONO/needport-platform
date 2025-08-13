'use client';
import { useState } from 'react';

export default function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-2">
      <textarea readOnly value={text} className="w-full h-56 p-3 rounded bg-neutral-900/40 border border-neutral-700" />
      <button
        onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false), 1500); }}
        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
      >{copied ? 'コピーしました' : 'LINE用テキストをコピー'}</button>
    </div>
  );
}
