"use client";

import { useState } from "react";

interface ShareActionsProps {
  title: string;
  url: string;
}

export default function ShareActions({ title, url }: ShareActionsProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleMailShare = () => {
    const subject = `NeedPort: ${title}`;
    const body = url;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleTwitterShare = () => {
    const text = title;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          リンクをコピー
        </button>
        <button
          onClick={handleMailShare}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          メールで共有
        </button>
        <button
          onClick={handleTwitterShare}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
        >
          Xで共有
        </button>
      </div>
      
      {showToast && (
        <div className="absolute top-full left-0 mt-2 bg-emerald-600 text-white px-3 py-1 rounded text-sm animate-in fade-in duration-200">
          コピーしました
        </div>
      )}
    </div>
  );
}
