import { readCms } from "@/lib/cms/storage";

export const dynamic = "force-dynamic";

export default async function ServiceOverviewPage() {
  const cms = await readCms();
  const so = cms.serviceOverview;

  return (
    <main className="p-6 space-y-10">
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold">{so.heroTitle}</h1>
        <p className="mt-2 text-lg opacity-95">{so.heroLead}</p>
      </section>

      <section id="flow" className="space-y-6">
        <h2 className="text-2xl font-semibold">サービスの流れ</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {so.flow.map((step, i) => (
            <div key={i} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <ul className="list-disc ml-5 space-y-1">
                {step.items.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="vendor-guide" className="space-y-4">
        <h2 className="text-2xl font-semibold">事業者向け提案ガイド</h2>
        {so.vendorGuide.map((g, i) => (
          <div key={i} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{g.title}</h3>
            <ul className="list-disc ml-5 space-y-1">
              {g.items.map((t, j) => <li key={j}>{t}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section id="faq" className="space-y-4">
        <h2 className="text-2xl font-semibold">よくある質問</h2>
        <div className="space-y-3">
          {so.faq.map((f, i) => (
            <details key={i} className="rounded border p-3">
              <summary className="font-medium">{f.q}</summary>
              <p className="mt-2 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
