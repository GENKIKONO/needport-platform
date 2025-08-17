"use client";
import { FileText, Handshake, ShieldCheck, MessageSquare, CreditCard } from "lucide-react";

const cards = [
  { title:"投稿",    ico: FileText,      body:"困りごとを投稿。個人情報は書かないでOK。" },
  { title:"提案",    ico: Handshake,     body:"業者から見積や方法の提案が届きます。" },
  { title:"承認",    ico: ShieldCheck,   body:"良い提案だけ承認して前へ進めます。" },
  { title:"ルーム",  ico: MessageSquare, body:"運営同席の承認制チャットで詳細を詰めます。" },
  { title:"支払い",  ico: CreditCard,    body:"Stripeの与信・エスクローで安全に受け渡し。" },
];

export default function ServiceFlowCarousel(){
  return (
    <section className="section">
      <h2 className="text-xl font-bold mb-3">サービスの流れ</h2>
      <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory space-x-3 flex">
        {cards.map((c,i)=>(
          <div key={i} className="snap-center min-w-[82%] sm:min-w-[360px] np-card p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2">
              <c.ico className="w-5 h-5 text-blue-600" />
              <div className="text-base font-semibold">{c.title}</div>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
