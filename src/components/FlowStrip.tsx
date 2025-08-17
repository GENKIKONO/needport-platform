'use client'
import { FileText, Handshake, ShieldCheck, MessagesSquare, CreditCard, Anchor } from "lucide-react";

const items = [
  { icon: FileText, label: '投稿',    tip: '困りごとを投稿（個人情報は書かない）' },
  { icon: Handshake, label: '提案',   tip: '業者が提案を寄せる' },
  { icon: ShieldCheck, label: '承認', tip: '良い提案だけを承認' },
  { icon: MessagesSquare, label: 'ルーム', tip: '承認メンバーで進行管理' },
  { icon: CreditCard, label: '支払い', tip: '安全な支払いで完了' },
];

export default function FlowStrip(){
  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3">
        <Anchor className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-neutral-700">ニーズの港 NeedPort の流れ</span>
      </div>
      <div className="grid grid-cols-5 gap-2 px-3 pb-3 pt-2 sm:gap-3 sm:px-4">
        {items.map(({icon:Icon,label,tip})=>(
          <div key={label} className="group rounded-xl p-3 sm:p-4 text-center hover:bg-neutral-50 transition-colors">
            <Icon className="mx-auto w-6 h-6 sm:w-7 sm:h-7 text-neutral-600 group-hover:text-blue-600" />
            <div className="mt-1.5 text-[13px] sm:text-sm font-medium">{label}</div>
            <div className="mt-1 text-[11px] sm:text-xs text-neutral-500 leading-snug">{tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
