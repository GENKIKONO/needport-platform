export default function SocialProof(){
  return (
    <section className="section">
      <h2 className="text-xl font-bold mb-6 text-center">利用者の声</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            name: "田中さん",
            role: "個人事業主",
            comment: "困りごとを投稿したら、すぐに業者から提案が届きました。承認制ルームで安心して進められました。",
            avatar: "👨‍💼"
          },
          {
            name: "佐藤さん", 
            role: "フリーランス",
            comment: "クラファンと違って、具体的な提案をもらえるのが良いです。運営も同席してくれるので安心です。",
            avatar: "👩‍💻"
          },
          {
            name: "山田さん",
            role: "小規模事業者",
            comment: "Stripeの与信で前払いの不安がなくなりました。持ち逃げの心配もありません。",
            avatar: "👨‍🏭"
          }
        ].map((t, i) => (
          <div key={i} className="np-card p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{t.avatar}</div>
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-neutral-500">{t.role}</div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">"{t.comment}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
