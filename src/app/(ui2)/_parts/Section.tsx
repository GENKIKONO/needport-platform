import { ReactNode } from "react";

export default function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
