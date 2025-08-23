import { 
  Squares2X2Icon, 
  PlusCircleIcon, 
  BuildingOffice2Icon,
  BookOpenIcon, 
  MapIcon, 
  QuestionMarkCircleIcon,
  MegaphoneIcon, 
  InformationCircleIcon,
  ArchiveBoxIcon
} from '@/components/icons';

export type MenuItem = { label: string; href: string; icon?: any };
export type MenuGroup = { title: string; items: MenuItem[] };

export const MENU: MenuGroup[] = [
  { title: "みんなの『欲しい』", items: [
    { label: "ニーズ一覧", href: "/needs", icon: Squares2X2Icon },
    { label: "ニーズを投稿", href: "/post", icon: PlusCircleIcon },
  ]},
  { title: "企業の『できる』", items: [
    { label: "事業者登録", href: "/vendor/register", icon: BuildingOffice2Icon },
    { label: "提案ガイド", href: "/guide/offer", icon: BookOpenIcon },
    { label: "海中（ニーズ保管庫）", href: "/kaichu", icon: ArchiveBoxIcon },
  ]},
  { title: "ガイド", items: [
    { label: "使い方ガイド", href: "/guide/using", icon: BookOpenIcon },
    { label: "サービスの流れ", href: "/service-overview", icon: InformationCircleIcon },
    { label: "サービス航海図", href: "/how-it-works", icon: MapIcon },
    { label: "よくある質問", href: "/faq", icon: QuestionMarkCircleIcon },
  ]},
  { title: "サイト情報", items: [
    { label: "お知らせ", href: "/news", icon: MegaphoneIcon },
    { label: "このサイトについて", href: "/about", icon: InformationCircleIcon },
  ]},
];
