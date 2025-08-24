import { 
  Squares2X2Icon, 
  PlusCircleIcon, 
  BuildingOffice2Icon,
  BookOpenIcon, 
  MapIcon, 
  QuestionMarkCircleIcon,
  MegaphoneIcon, 
  InformationCircleIcon,
  ArchiveBoxIcon,
  UserIcon,
  HomeIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export type MenuItem = { 
  label: string; 
  href: string; 
  icon?: any; 
  tag?: "fixed" | "cms"; 
};
export type MenuGroup = { title: string; items: MenuItem[] };

export const MENU: MenuGroup[] = [
  { title: "メイン", items: [
    { label: "ホーム", href: "/", icon: HomeIcon, tag: "fixed" },
    { label: "ニーズ一覧", href: "/needs", icon: Squares2X2Icon, tag: "fixed" },
    { label: "ニーズ投稿", href: "/needs/new", icon: PlusCircleIcon, tag: "fixed" },
    { label: "海中", href: "/kaichu", icon: ArchiveBoxIcon, tag: "fixed" },
  ]},
  { title: "サービス", items: [
    { label: "サービス航海図", href: "/service-overview", icon: InformationCircleIcon, tag: "fixed" },
  ]},
  { title: "認証", items: [
    { label: "一般ログイン", href: "/auth/login", icon: UserIcon, tag: "fixed" },
    { label: "一般登録", href: "/auth/register", icon: UserIcon, tag: "fixed" },
    { label: "事業者ログイン", href: "/vendor/login", icon: BuildingOffice2Icon, tag: "fixed" },
    { label: "事業者登録", href: "/vendor/register", icon: BuildingOffice2Icon, tag: "fixed" },
  ]},
  { title: "アカウント", items: [
    { label: "マイページ", href: "/me", icon: UserIcon, tag: "fixed" },
  ]},
  { title: "情報", items: [
    { label: "会社情報", href: "/about", icon: InformationCircleIcon, tag: "cms" },
    { label: "利用規約", href: "/legal/terms", icon: DocumentTextIcon, tag: "cms" },
    { label: "プライバシーポリシー", href: "/legal/privacy", icon: ShieldCheckIcon, tag: "cms" },
    { label: "特定商取引法", href: "/legal/tokusho", icon: DocumentTextIcon, tag: "cms" },
  ]},
];
