'use client'
import React from 'react'
export default function Logo({ showText=false, className="" }:{ showText?:boolean; className?:string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-harbor-600 text-white shadow-port">
        {/* boat with small wake */}
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
          <path d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z"/>
        </svg>
        <span className="absolute -bottom-1 left-1 right-1 h-1 rounded-full bg-sea-500/40" />
      </span>
      {showText && <span className="font-semibold text-neutral-900">NeedPort</span>}
    </span>
  )
}
