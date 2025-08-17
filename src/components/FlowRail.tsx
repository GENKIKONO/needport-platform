'use client'
import { useEffect, useState } from 'react'
import { FileText, Handshake, ShieldCheck, Square, CreditCard } from 'lucide-react'

const STEPS = [
  { key:'post',   label:'投稿',  sub:'困りごとを投稿', icon: FileText },
  { key:'offer',  label:'提案',  sub:'業者から提案が届く', icon: Handshake },
  { key:'accept', label:'承認',  sub:'良い提案だけ承認', icon: ShieldCheck },
  { key:'room',   label:'ルーム', sub:'承認メンバーで進行', icon: Square },
  { key:'pay',    label:'支払い', sub:'安全な支払いで完了', icon: CreditCard },
]

export default function FlowRail(){
  const [active, setActive] = useState(0)
  useEffect(()=>{
    const id = setInterval(()=> setActive(a => (a+1)%STEPS.length), 2400)
    return () => clearInterval(id)
  },[])
  return (
    <div className="mx-auto max-w-5xl np-card px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
        <span className="i-lucide-anchor w-5 h-5" />
        <span>ニーズの港 NeedPort の流れ</span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const on = i === active
          return (
            <div key={s.key}
              className={`rounded-lg border text-center px-2 py-3 sm:py-4 transition-all
                          ${on ? 'border-blue-400 bg-blue-50/60 shadow-sm' : 'border-neutral-200 bg-white'}`}>
              <Icon className={`mx-auto mb-1 ${on ? 'text-blue-600' : 'text-neutral-500'}`} size={22}/>
              <div className={`text-sm font-medium ${on?'text-neutral-900':'text-neutral-700'}`}>{s.label}</div>
              <div className="text-xs text-neutral-500 mt-0.5 hidden sm:block">{s.sub}</div>
            </div>
          )
        })}
      </div>
      {/* 船影が上部をスーッと移動（控えめ） */}
      <div className="relative mt-2 h-1">
        <div
          className="absolute top-0 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-300 via-white to-transparent blur-[2px] transition-all duration-500"
          style={{ left: `calc(${active} * 20% + 4%)` }}
          aria-hidden
        />
      </div>
    </div>
  )
}
