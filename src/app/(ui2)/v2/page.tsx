"use client";

import Card from "../_parts/Card";

export default function V2HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">NeedPort（ニードポート）</h1>
      <p className="text-slate-600 text-lg">
        匿名で条件を合わせてから顔合わせすることでフラットなマッチング。<br/>
        埋もれた声をつなぎ、形にするプラットフォームです。
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <Card.Header><div className="font-semibold text-xl">ニーズを探す</div></Card.Header>
          <Card.Body>
            生活や地域に埋もれたニーズを検索・フィルタ。<br/>
            気になる案件には「かんたん提案」も可能です。
          </Card.Body>
          <Card.Footer>
            <a href="/v2/needs" className="px-3 py-2 rounded bg-sky-600 text-white">ニーズ一覧へ</a>
          </Card.Footer>
        </Card>

        <Card>
          <Card.Header><div className="font-semibold text-xl">事業者を探す</div></Card.Header>
          <Card.Body>
            登録済みの事業者プロフィールをカテゴリ別に一覧。<br/>
            成果報酬対象外カテゴリも分かりやすく表示します。
          </Card.Body>
          <Card.Footer>
            <a href="/v2/vendors" className="px-3 py-2 rounded bg-sky-600 text-white">事業者リストへ</a>
          </Card.Footer>
        </Card>

        <Card>
          <Card.Header><div className="font-semibold text-xl">介護タクシー依頼</div></Card.Header>
          <Card.Body>
            5W1Hの簡単入力で介護タクシーのニーズ投稿が可能。<br/>
            承認後、対応事業者が提案を送信できます。
          </Card.Body>
          <Card.Footer>
            <a href="/v2/needs/new" className="px-3 py-2 rounded bg-sky-600 text-white">依頼を投稿</a>
          </Card.Footer>
        </Card>
      </div>

      <div className="bg-slate-50 border rounded p-4 space-y-2">
        <h2 className="text-xl font-semibold">NeedPortが大事にしていること</h2>
        <ul className="list-disc pl-6 text-slate-700 space-y-1">
          <li>小さな声を拾い、匿名で投稿できる</li>
          <li>共感が集まることで事業性を生む</li>
          <li>匿名からスタートする安心な取引</li>
          <li>成約時のみシンプルな手数料</li>
          <li>データを活かして未来のサービスへ</li>
        </ul>
      </div>
    </div>
  );
}
