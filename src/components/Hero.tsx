import Link from 'next/link';

export default function Hero() {
  return (
    <section className="container py-10">
      <div className="card p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ニーズ起点で、安心して出会える。</h1>
        <p className="mt-3 text-sm md:text-base text-neutral-300">
          NeedPort は、困りごと（ニーズ）から始まるマッチングOS。安全に、最小摩擦で、発注と受注をつなぎます。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/signup" className="btn btn-primary">無料で登録する</Link>
          <a href="#needs" className="btn btn-ghost">案件を探す</a>
        </div>
      </div>
    </section>
  );
}
