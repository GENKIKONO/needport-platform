"use client";
import { useState } from "react";
import Link from "next/link";
import { getNeedsSafe } from "@/lib/demo/data";
import InterestDialog from "./InterestDialog";

export default function HomeFeatured() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState<{open: boolean, need: any}>({open: false, need: null});

  // データ取得
  useState(() => {
    getNeedsSafe().then(setNeeds);
  });

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 bg-white">
        {needs.slice(0, 3).map(n => (
          <article key={n.id} className="np-card overflow-hidden">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-4xl opacity-50">📋</div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{n.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{n.description}</p>
              
              {/* Meta info */}
              <div className="flex items-center gap-2 mb-4">
                <span className="np-badge bg-blue-100 text-blue-800">{n.category}</span>
                <span className="np-badge bg-gray-100 text-gray-600">{n.area}</span>
              </div>
              
              {/* CTA */}
              <div className="flex gap-2">
                <Link href={`/needs/${n.id}`} className="btn btn-primary flex-1">
                  詳細を見る
                </Link>
                <button 
                  type="button" 
                  className="btn btn-ghost flex-1" 
                  onClick={() => setOpenDialog({open: true, need: n})}
                >
                  賛同する
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {openDialog.open && (
        <InterestDialog
          open={openDialog.open}
          onClose={() => setOpenDialog({open: false, need: null})}
          need={openDialog.need}
        />
      )}
    </>
  );
}
