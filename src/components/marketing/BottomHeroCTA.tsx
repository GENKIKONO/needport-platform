import Link from "next/link"

export default function BottomHeroCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 mt-16">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 text-white px-6 py-10 md:px-10 md:py-14 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold">NeedPortが描く未来へ、いま出港。</h2>
        <p className="mt-2 text-white/90">リアルな「欲しい」を集め、共創し、形にする。あなたの一歩が、次の価値を生みます。</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/needs/new" className="inline-flex items-center gap-2 rounded-xl bg-white text-sky-700 px-4 py-2 font-semibold shadow hover:shadow-md">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ニーズを投稿
          </Link>
          <Link href="/needs" className="inline-flex items-center gap-2 rounded-xl bg-sky-800/30 ring-1 ring-white/40 px-4 py-2 font-semibold hover:bg-sky-800/40">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            ニーズを探す
          </Link>
        </div>
      </div>
    </section>
  )
}
