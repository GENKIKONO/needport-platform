"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PublishToggleProps {
  needId: string;
  isPublished: boolean;
}

export default function PublishToggle({ needId, isPublished }: PublishToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/needs/${needId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !published }),
      });

      const result = await response.json();

      if (result.ok) {
        setPublished(!published);
        router.refresh();
      } else {
        console.error("Failed to toggle publish status:", result.error);
        alert("公開状態の変更に失敗しました");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">公開状態</h3>
          <p className="text-sm text-muted-foreground">
            {published ? "公開中" : "非公開"}
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${published
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
            }
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isLoading ? "処理中..." : published ? "非公開にする" : "公開する"}
        </button>
      </div>
    </div>
  );
}
