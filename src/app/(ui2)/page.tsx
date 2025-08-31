import Hero from "./_parts/Hero";
import Section from "./_parts/Section";
import Link from "next/link";

function ValueItem({title, body}:{title:string; body:string}) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="font-medium text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{body}</div>
    </div>
  );
}

export default function V2Home() {
  return (
    <main className="bg-white">
      <Hero />

      <Section title="NeedPortが大事にしていること" subtitle="匿名で条件を合わせてから顔合わせ—フラットで透明な取引を支えます。">
        <div className="grid md:grid-cols-3 gap-4">
          <ValueItem title="小さな声を拾う" body="『頼みたいけど誰に言えばいいかわからない』を匿名で投稿できます。" />
          <ValueItem title="共感が力になる" body="賛同が集まれば、1人では成立しない依頼も現実的になります。" />
          <ValueItem title="顔が見えないから安心" body="投稿段階では双方匿名。成約段階で必要情報のみ開示します。" />
          <ValueItem title="シンプルな仕組み" body="成約時10%を基本に、業種によってはサブスク/対象外の設計。" />
          <ValueItem title="データが未来をつくる" body="地域×ニーズ×成立データを蓄積し、次のサービスへ還元します。" />
          <ValueItem title="運営が種をまく" body="最初は運営が想定ニーズを提示して需要を可視化します。" />
        </div>
      </Section>

      <Section title="例えば、こんな使い方">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-white">
            <div className="font-medium">冠婚葬祭＋介護タクシー</div>
            <div className="mt-1 text-sm text-slate-600">「結婚式に車イスの家族を呼びたい」—運営の想定ニーズに、登録事業者が提案。承認後は直接やり取りに。</div>
          </div>
          <div className="p-4 rounded-lg border bg-white">
            <div className="font-medium">リフォーム・住まい</div>
            <div className="mt-1 text-sm text-slate-600">「自宅サウナ」「地下室」など1軒では高額でも、複数人の賛同で事業化ラインへ。</div>
          </div>
          <div className="p-4 rounded-lg border bg-white">
            <div className="font-medium">生活支援</div>
            <div className="mt-1 text-sm text-slate-600">「週3回の作り置き」「冬場だけの送迎シェア」—季節・地域のニッチを束ねて成立。</div>
          </div>
        </div>
      </Section>

      <Section title="差別化ポイント">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-white">
            <div className="font-medium">介護マッチングではない</div>
            <div className="mt-1 text-sm text-slate-600">高齢者向けも扱えるが、対象は生活全般のニーズ。</div>
          </div>
          <div className="p-4 rounded-lg border bg-white">
            <div className="font-medium">クラファンではない</div>
            <div className="mt-1 text-sm text-slate-600">お金集めではなく、需要の束ね＋事業者との直接契約にフォーカス。</div>
          </div>
          <div className="p-4 rounded-lg border bg-white">
            <div className="font-medium">しがらみの外で</div>
            <div className="mt-1 text-sm text-slate-600">匿名で条件調整→成約後に顔合わせ。フラットで断りやすい関係を担保。</div>
          </div>
        </div>
      </Section>

      <Section title="今すぐはじめる">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <Link href="/v2/needs" className="inline-flex items-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">ニーズを探す</Link>
          <Link href="/v2/needs/new" className="inline-flex items-center rounded-md bg-white border px-4 py-2 text-sm hover:bg-slate-50">ニーズを投稿する</Link>
          <Link href="/v2/vendors" className="inline-flex items-center rounded-md bg-white border px-4 py-2 text-sm hover:bg-slate-50">事業者リストを見る</Link>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          成果報酬対象外の業種（例：介護タクシー）は「顔出し登録＋月額サブスク」で参加可能。
        </div>
      </Section>
    </main>
  );
}
