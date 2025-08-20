export type NavItem = { label: string; href: string };
export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "みんなの「欲しい」",
    items: [
      { label: "ニーズ一覧", href: "/needs" },
      { label: "タグで探す", href: "/needs?sort=trending" },
    ],
  },
  {
    title: "企業の「できる」",
    items: [
      { label: "事業者登録", href: "/vendors/new" },
      { label: "提案・見積の流れ", href: "/guide/offer" },
    ],
  },
  {
    title: "使い方ガイド",
    items: [
      { label: "投稿の流れ", href: "/guide/posting" },
      { label: "サポート", href: "/support" },
    ],
  },
  {
    title: "サイト情報",
    items: [
      { label: "NeedPortについて", href: "/about" },
      { label: "利用規約", href: "/terms" },
    ],
  },
];
