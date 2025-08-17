'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ToastShip(){
  const [show, setShow] = useState(false)

  useEffect(()=>{
    const on = () => { setShow(true); const t=setTimeout(()=>setShow(false), 1900); return () => clearTimeout(t)}
    const h = () => on()
    window.addEventListener('np:post:success', h as any)
    return () => window.removeEventListener('np:post:success', h as any)
  },[])

  if (typeof document === 'undefined') return null
  return createPortal(
    show ? (
      <>
        <div className="np-wake" />
        <div className="np-ship">
          {/* 小さな船アイコン（SVG） */}
          <svg width="42" height="20" viewBox="0 0 84 40" className="drop-shadow-sm">
            <g fill="none" fillRule="evenodd">
              <path d="M4 28h76c-2 6-12 10-38 10S6 34 4 28z" fill="#0ea5e9"/>
              <path d="M20 26h24l-3-8H23z" fill="#1f2937"/>
              <path d="M28 18h18l-3-6H31z" fill="#374151"/>
              <rect x="49" y="18" width="10" height="8" rx="1.5" fill="#2563eb"/>
              <circle cx="54" cy="22" r="2" fill="#93c5fd"/>
            </g>
          </svg>
        </div>
      </>
    ) : null,
    document.body
  )
}
