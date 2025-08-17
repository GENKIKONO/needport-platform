"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getNeedsSafe } from "@/lib/demo/data";
import InterestDialog from "./InterestDialog";

export default function HomeSoon() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState<{open: boolean, need: any}>({open: false, need: null});

  // データ取得
  useState(() => {
    getNeedsSafe().then(setNeeds);
  });

  function handleDone(needId: string, newCounts?: Record<string,number>) {
    // 賛同済み状態を保存
    if (typeof window !== "undefined") {
      localStorage.setItem(`np_endorsed_${needId}`, "1");
    }
    // カウント更新（楽観的更新）
    if (newCounts) {
      setNeeds(prev => prev.map(n => 
        n.id === needId 
          ? { ...n, counts: newCounts }
          : n
      ));
    }
  }

  const hot = needs.filter(n => (n.progress ?? 0) >= 0.8).slice(0, 3);
  
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 bg-white">
        {hot.map(n => (
          <article key={n.id} className="np-card p-6 card-hover card-press">
            <header className="flex items-start justify-between gap-3 mb-3">
              <h3 className="np-title text-base md:text-lg line-clamp-2">{n.title}</h3>
              <span className="np-badge bg-red-100 text-red-600">
                目安{Math.max(1, Math.ceil((n.target ?? 10) - (n.count ?? 0)))}人
              </span>
            </header>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{n.description}</p>
            <div className="mb-4">
              <div className="np-progress bg-gray-200">
                <div 
                  className="h-full bg-brand-600" 
                  style={{ width: `${Math.min(100, Math.round((n.progress ?? 0) * 100))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-right text-gray-500">
                {Math.round((n.progress ?? 0) * 100)}%
              </div>
            </div>
            <EndorseButton 
              need={n} 
              onOpen={() => setOpenDialog({open: true, need: n})}
              onDone={(counts) => handleDone(n.id, counts)}
            />
          </article>
        ))}
      </div>

      {openDialog.open && (
        <InterestDialog
          open={openDialog.open}
          onClose={() => setOpenDialog({open: false, need: null})}
          onDone={(counts) => handleDone(openDialog.need.id, counts)}
          need={openDialog.need}
        />
      )}
    </>
  );
}

// 賛同ボタンコンポーネント
function EndorseButton({ need, onOpen, onDone }: { 
  need: any; 
  onOpen: () => void; 
  onDone: (counts?: Record<string,number>) => void;
}) {
  const [endorsed, setEndorsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEndorsed(!!localStorage.getItem(`np_endorsed_${need.id}`));
    }
  }, [need.id]);

  function handleDone(counts?: Record<string,number>) {
    setEndorsed(true);
    onDone(counts);
  }

  return (
    <button 
      type="button" 
      disabled={endorsed}
      className={`btn btn-primary w-full ${endorsed ? "opacity-60 cursor-default" : ""}`}
      onClick={onOpen}
    >
      {endorsed ? "賛同済み" : "いますぐ賛同する"}
    </button>
  );
}
