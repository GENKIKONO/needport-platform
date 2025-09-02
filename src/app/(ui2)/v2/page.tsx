import Link from "next/link";
import { Badge } from "../_parts/Badge";
import { Card } from "../_parts/Card";
import { Button } from "../_parts/Button";

export const metadata = {
  title: "NeedPort – 埋もれた声を、つなぐ。形にする。",
  description: "顔が見えない安心感 × ニーズの束ね × 透明な取引で、生活ニーズを事業に変えるプラットフォーム。",
  openGraph: { title: "NeedPort", url: "https://needport.jp/v2" }
};

export default function V2Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="relative">
        <div className="container-page py-14 sm:py-20">
          <div className="space-y-6">
            <Badge>NeedPort（ニードポート）とは？</Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              埋もれた声を、<span className="text-brand">つなぐ</span>。形にする。
            </h1>
            <p className="text-slate-600 max-w-2xl">
              顔が見えない安心感 × ニーズの束ね × 透明な取引で、
              これまで成立しなかった生活ニーズを事業に変えるプラットフォーム。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/v2/needs"><Button size="lg">ニーズを探す</Button></Link>
              <Link href="/v2/needs/new"><Button variant="secondary" size="lg">ニーズを投稿</Button></Link>
              <Badge variant="soft">匿名で安心</Badge>
              <Badge variant="soft">賛同で実現</Badge>
              <Badge variant="soft">成約時10%</Badge>
            </div>
          </div>
        </div>
        <svg className="absolute bottom-[-1px] left-0 w-full" viewBox="0 0 1440 120" aria-hidden>
          <path fill="#e0f2fe" d="M0,64L80,69.3C160,75,320,85,480,90.7C640,96,800,96,960,85.3C1120,75,1280,53,1360,42.7L1440,32L1440,0L0,0Z"/>
        </svg>
      </header>

      <section className="section container-page">
        <h2 className="text-xl font-bold mb-6">NeedPort が大事にしていること</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["小さな声を拾う","匿名で"言いづらい"ニーズも投稿できます。"],
            ["共感が力になる","賛同が集まれば一人では無理でも実現に近づく。"],
            ["顔が見えないから安心","成約まで匿名。しがらみなくフラットに。"],
            ["シンプルな仕組み","成約時10%の手数料。特定業種は月額登録。"],
            ["データが未来をつくる","地域のニーズデータを資産化し次の事業へ。"],
            ["運営が最初の種まき","想定ニーズを提示して鶏卵問題を解消。"],
          ].map(([h,b], i) => (
            <Card key={i} className="card">
              <Card.Header>{h}</Card.Header>
              <Card.Body className="text-slate-600">{b}</Card.Body>
            </Card>
          ))}
        </div>
      </section>

      <section className="section container-page">
        <h2 className="text-xl font-bold mb-6">使い方（匿名→条件すり合わせ→成約）</h2>
        <ol className="grid gap-4 sm:grid-cols-3 list-decimal list-inside">
          {[
            ["ニーズを投稿 / 賛同", "匿名で投稿。賛同が集まると事業者から提案が来ます。"],
            ["承認制チャットで条件調整", "提案ごとに独立したチャット。混線せず安心。"],
            ["成約で必要最小限だけ開示", "成約時にだけ事業者情報を開示し、取引へ。"],
          ].map(([h,b],i)=>(
            <li key={i} className="card p-4">
              <div className="font-semibold">{h}</div>
              <div className="text-slate-600 text-sm mt-1">{b}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section container-page">
        <h2 className="text-xl font-bold mb-6">例えば、こんな声から始まります</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["建築・リフォーム",""自宅サウナをつけたい"など、複数で束ねて実現。"],
            ["冠婚葬祭＋介護タクシー",""結婚式に車イスの家族を呼びたい"を支援。"],
            ["生活支援",""週3回だけ作り置き"など日常の小さな困りごと。"],
          ].map(([h,b],i)=>(
            <Card key={i} className="card">
              <Card.Header>{h}</Card.Header>
              <Card.Body className="text-slate-600">{b}</Card.Body>
            </Card>
          ))}
        </div>
      </section>

      <section className="section container-page">
        <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-sky-50 border-sky-100">
          <div>
            <div className="font-bold">NeedPort をはじめましょう</div>
            <div className="text-slate-600 text-sm">匿名で投稿して、賛同を集め、事業者とマッチング。</div>
          </div>
          <div className="flex gap-2">
            <Link href="/v2/needs/new"><Button size="lg">ニーズを投稿</Button></Link>
            <Link href="/v2/vendors"><Button variant="secondary" size="lg">事業者として参加</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
