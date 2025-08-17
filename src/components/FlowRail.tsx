'use client'
import { useEffect, useState } from 'react'
import { FileText, Handshake, ShieldCheck, Square, CreditCard } from 'lucide-react'

const STEPS = [
  { label:'投稿',  icon: FileText,    cap:'困りごとを投稿（個人情報は書かない）' },
  { label:'提案',  icon: Handshake,   cap:'業者から方法と見積の提案が届く' },
  { label:'承認',  icon: ShieldCheck, cap:'良い提案だけ承認して進む' },
  { label:'ルーム',icon: Square,      cap:'承認メンバーで進行を管理' },
  { label:'支払い',icon: CreditCard,  cap:'安全な支払いで完了' },
]

export default function FlowRail(){
  const [active, setActive] = useState(0)
  useEffect(()=>{ const id=setInterval(()=>setActive(a=>(a+1)%STEPS.length),2400); return ()=>clearInterval(id)},[])
  return (
    <div className="mx-auto max-w-5xl np-card px-4 py-5">
      <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
        <span className="i-lucide-anchor w-5 h-5" />
        <span>NeedPort の流れ</span>
      </div>

      {/* アイコンだけの軸（スマホは横スクロール） */}
      <div className="relative">
        <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar snap-x">
          {STEPS.map((s,i)=>{
            const Icon=s.icon; const on=i===active
            return (
              <button key={s.label}
                onClick={()=>setActive(i)}
                className={`snap-start shrink-0 text-center outline-none`}
                aria-pressed={on}
              >
                <div className={`mx-auto grid place-items-center h-12 w-12 rounded-full border transition
                                 ${on?'border-blue-500 bg-blue-50':'border-neutral-300 bg-white'}`}>
                  <Icon className={`${on?'text-blue-600':'text-neutral-500'}`} size={22}/>
                </div>
                <div className={`mt-2 text-sm font-medium ${on?'text-neutral-900':'text-neutral-700'}`}>{s.label}</div>
              </button>
            )
          })}
        </div>

        {/* キャプション1行だけ（スマホ優先）。PCでは少し大きく */}
        <p className="mt-3 text-center text-[13px] sm:text-sm text-neutral-600">
          {STEPS[active].cap}
        </p>
      </div>
    </div>
  )
}
