import { readCms } from "@/lib/cms/storage";

export default async function HomeServiceSummary() {
  const cms = await readCms();
  const steps = cms.homeSummary.steps;

  return (
    <section className="mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {steps.map((s, i) => (
          <a key={i} href={s.href ?? "#"} className="block border rounded-lg p-4 hover:shadow-sm">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
