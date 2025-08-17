'use client'
import React from 'react'
export default function Logo({ showText=false, className="" }:{ showText?:boolean; className?:string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
        {/* simple boat */}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M3 16c4 2 14 2 18 0l-1 3H4l-1-3Zm2-3h14l-1-4H6l-1 4Zm2-6h10l-1-2H8l-1 2Z"/>
        </svg>
      </span>
      {showText && <span className="font-semibold text-neutral-900">NeedPort</span>}
    </span>
  )
}
