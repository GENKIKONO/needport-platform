'use client'
import { FileText, Handshake, ShieldCheck, Square, CreditCard, Ship } from 'lucide-react'

const items = [
  {icon: FileText,  label:'投稿'},
  {icon: Handshake, label:'提案'},
  {icon: ShieldCheck,label:'承認'},
  {icon: Square,    label:'ルーム'},
  {icon: CreditCard,label:'支払い'},
]

export default function FlowStrip() {
  return (
    <div className="np-card p-4 sm:p-5">
      {/* 航路 */}
      <div className="relative h-7">
        <div className="absolute inset-y-2 left-0 right-0 rounded-full bg-sky-100 overflow-hidden">
          <div className="route-water absolute inset-0" />
        </div>
        <Ship aria-hidden className="route-boat absolute -top-0.5 left-0 h-7 w-7 text-blue-600" />
      </div>
      {/* 5アイコン（等幅グリッド） */}
      <ul className="mt-3 grid grid-cols-5 gap-2 text-center text-sm text-neutral-700">
        {items.map(({icon:Icon,label}) => (
          <li key={label} className="flex flex-col items-center gap-1">
            <Icon className="h-[22px] w-[22px]" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
