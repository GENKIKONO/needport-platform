export type MenuItem = { label: string; href: string; icon?: string };
export type MenuGroup = { title: string; items: MenuItem[] };

export const MENU: MenuGroup[] = [
  { title: "みんなの『欲しい』", items: [
    { label: "ニーズ一覧", href: "/needs", icon: "list" },
    { label: "ニーズを投稿", href: "/post", icon: "plus" },
  ]},
  { title: "企業の『できる』", items: [
    { label: "事業者登録", href: "/vendor/register", icon: "building" },
    { label: "提案ガイド", href: "/guide/offer", icon: "book" },
  ]},
  { title: "ガイド", items: [
    { label: "使い方ガイド", href: "/guide/using", icon: "guide" },
    { label: "サービス航海図", href: "/how-it-works", icon: "route" },
    { label: "よくある質問", href: "/faq", icon: "help" },
  ]},
  { title: "サイト情報", items: [
    { label: "お知らせ", href: "/news", icon: "megaphone" },
    { label: "このサイトについて", href: "/about", icon: "info" },
    { label: "利用規約", href: "/terms", icon: "document" },
  ]},
];
