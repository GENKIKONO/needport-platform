'use client'
import React from 'react'
export default function Logo({ showText=false, className="" }:{ showText?:boolean; className?:string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-harbor-600 text-white shadow-port">
        {/* boat with small wake */}
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
          <path d="M3 14c5 3 13 3 18 0l-1 4H4l-1-4Zm3-3h12l-1-4H7l-1 4Zm2-6h8l-1-2H10l-2 2Z"/>
        </svg>
        <span className="absolute -bottom-1 left-1 right-1 h-1 rounded-full bg-sea-500/40" />
      </span>
      {showText && <span className="font-semibold text-neutral-900">NeedPort</span>}
    </span>
  )
}
