import { ChartBar, ShieldCheck, MessageSquare, CreditCard } from "lucide-react";

export default function ValueGrid(){
  const vals = [
    { t:"可視化されるニーズ", d:"集まる前の「兆し」から見える化。確度の高い案件にだけ動ける。", i:ChartBar },
    { t:"承認制ルーム", d:"ユーザー/業者/運営の三者で、承認された相手とだけやり取り。", i:MessageSquare },
    { t:"安全な支払い", d:"Stripeの与信・分配で前払い/持ち逃げの不安を軽減。", i:CreditCard },
  ];
  return (
    <section className="section">
      <div className="grid gap-4 md:grid-cols-3">
        {vals.map((v,i)=>(
          <div key={i} className="np-card p-6 card-hover">
            <v.i className="w-6 h-6 text-sky-600" />
            <h3 className="mt-3 font-semibold">{v.t}</h3>
            <p className="mt-2 text-sm text-neutral-600">{v.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
