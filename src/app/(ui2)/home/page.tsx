import HeaderV2 from "../_parts/Header";
import FooterV2 from "../_parts/Footer";
import Link from "next/link";
export default function HomeV2(){
  return (
    <>
      <HeaderV2/>
      <main className="max-w-6xl mx-auto px-3 py-8">
        <section className="py-10">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3">ニッチなニーズを、形に。</h1>
          <p className="text-slate-600">賛同者が集まり、事業性が生まれ、事業者がマッチングする。</p>
          <div className="mt-6 flex gap-3">
            <Link href="/needs" className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">ニーズを見る</Link>
            <Link href="/vendors" className="px-4 py-2 rounded border hover:bg-slate-50">事業者リスト</Link>
          </div>
        </section>
      </main>
      <FooterV2/>
    </>
  );
}
