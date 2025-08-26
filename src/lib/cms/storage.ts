import fs from "node:fs/promises";
import path from "node:path";
import type { CmsData } from "./types";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "content");
const DATA_FILE = path.join(DATA_DIR, "cms.json");

// ENV で明示切替: dev以外でも書込したいときは CMS_WRITE=1
const CAN_WRITE =
  process.env.NODE_ENV === "development" || process.env.CMS_WRITE === "1";

export async function readCms(): Promise<CmsData> {
  try {
    const buf = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(buf) as CmsData;
  } catch {
    // 初期データを作って返す（devの初回起動用）
    const initial: CmsData = {
      registry: [
        { id: "service.flow",     tag: "cms",  title: "サービス航海図 / 流れ" },
        { id: "service.vendor",   tag: "cms",  title: "サービス航海図 / 提案ガイド" },
        { id: "service.faq",      tag: "cms",  title: "サービス航海図 / FAQ" },
        { id: "home.summary",     tag: "cms",  title: "トップ要約ブロック" },
        { id: "nav.left",         tag: "cms",  title: "左ナビ文言" },
        { id: "footer.links",     tag: "cms",  title: "フッター" },
      ],
      serviceOverview: {
        heroTitle: "共感の力",
        heroLead: "ひとりの「欲しい」がみんなの「必要」に。",
        flow: [
          { title: "1. 依頼を投稿", items: ["概要・希望条件を入力", "公開範囲を選択"] },
          { title: "2. 提案を受ける", items: ["事業者からの提案が届く", "比較・質問で詰める"] },
          { title: "3. 成立・キックオフ", items: ["条件合意で成立", "チャットで進行開始"] },
          { title: "4. 支払い", items: ["Stripeで安全決済", "分割/前払いは後日対応"] },
          { title: "5. 納品・検収", items: ["納品物を確認", "修正依頼にも対応"] },
          { title: "6. サポート", items: ["トラブル時は運営が介入", "実績と評価が蓄積"] },
        ],
        vendorGuide: [
          { title: "提案ガイド", items: ["課題を正確に捉える", "スコープを明確に", "見積根拠を示す", "進行方法を提示", "リスクを先出し"] }
        ],
        faq: [
          { q: "手数料はかかりますか？", a: "ベータ期間は無料です（将来変更の可能性あり）。" },
          { q: "安全性は？", a: "Stripe決済・匿名質問・運営の介入で安全を担保します。" }
        ],
      },
      homeSummary: {
        steps: [
          { title: "依頼", body: "やりたいこと・困りごとを投稿", href: "/needs/new" },
          { title: "提案", body: "事業者から提案が届く", href: "/service-overview#flow" },
          { title: "成立", body: "合意してプロジェクト開始" },
          { title: "支払い", body: "Stripeで安全に決済" },
          { title: "サポート", body: "トラブルは運営がフォロー" },
        ]
      },
      navigation: {
        groups: [
          {
            title: "みんなの『欲しい』",
            items: [
              { label: "ニーズ一覧", href: "/needs" },
              { label: "ニーズを投稿", href: "/needs/new" }
            ]
          },
          {
            title: "企業の『できる』",
            items: [
              { label: "事業者登録", href: "/vendor/register" },
              { label: "提案ガイド", href: "/service-overview#vendor-guide" }
            ]
          },
          {
            title: "ガイド",
            items: [
              { label: "サービス航海図", href: "/service-overview" },
              { label: "よくある質問", href: "/service-overview#faq" }
            ]
          }
        ]
      },
      footer: {
        columns: [
          { title: "NeedPort", links: [{ label: "このサイトについて", href: "/about" }] },
          { title: "サービス", links: [{ label: "航海図", href: "/service-overview" }] },
          { title: "サポート", links: [{ label: "FAQ", href: "/service-overview#faq" }] }
        ],
        copyright: "© 2024 NeedPort. All rights reserved."
      }
    };
    if (CAN_WRITE) {
      fs.mkdir(DATA_DIR, { recursive: true }).then(() =>
        fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8")
      ).catch(()=>{});
    }
    return initial;
  }
}

export async function writeCms(nextData: CmsData) {
  if (!CAN_WRITE) {
    // 本番/プレビュー既定はread-only。ONにしたいときは CMS_WRITE=1 を入れる
    return { ok: false, reason: "read-only" as const };
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(nextData, null, 2), "utf-8");
  return { ok: true as const };
}
