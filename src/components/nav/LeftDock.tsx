import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { 
  ListBulletIcon, 
  PlusIcon, 
  BuildingOffice2Icon, 
  BookOpenIcon, 
  AcademicCapIcon,
  MapIcon,
  QuestionMarkCircleIcon,
  MegaphoneIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from "@/components/icons";
import { events } from "@/lib/events";
import { getMenuData } from "./menuData";

export default async function LeftDock() {
  const menu = await getMenuData();
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:h-dvh lg:sticky lg:top-0 lg:overflow-y-auto border-r bg-white">
      {/* ロゴ（船）/サイト名 */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Logo className="w-7 h-7" />
        <span className="font-semibold text-[var(--ink-900)]">NeedPort</span>
      </div>
      
      {/* メニュー（アイコン+テキスト） */}
      <nav className="flex-1 px-2 py-4 space-y-6">
        {menu.map(g => (
          <div key={g.title}>
            <div className="px-2 text-xs font-semibold text-[var(--ink-500)] mb-2">{g.title}</div>
            <ul className="space-y-1">
              {g.items.map(i => (
                <li key={i.href}>
                  <Link 
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 hover:bg-[var(--blue-100)] hover:text-[var(--blue-700)] transition-colors" 
                    href={i.href}
                  >
                    <span className="font-medium text-[15px]">{i.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        {/* CMS（暫定）リンク */}
        <div className="px-2 text-xs font-semibold text-[var(--ink-500)] mb-2">管理</div>
        <ul className="space-y-1">
          <li>
            <Link 
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 hover:bg-[var(--blue-100)] hover:text-[var(--blue-700)] transition-colors" 
              href="/cms"
            >
              <span className="font-medium text-[15px]">CMS（暫定）</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* 二つのボタン（横並び）：一般ログイン / 事業者ログイン */}
      <div className="p-4 border-t space-y-3">
        <Link href="/signup" className="block w-full bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white text-center py-3 rounded-xl font-semibold shadow-[var(--elev-1)] hover:opacity-95 transition-all">
          一般ログイン
        </Link>
        <Link href="/vendor/register" className="block w-full border-2 border-[var(--blue-600)] text-[var(--blue-700)] bg-white text-center py-3 rounded-xl font-semibold hover:bg-[var(--blue-100)] transition-all">
          事業者ログイン
        </Link>
      </div>
    </aside>
  );
}

function getIcon(icon: string) {
  switch (icon) {
    case 'list': return <ListBulletIcon />;
    case 'plus': return <PlusIcon />;
    case 'building': return <BuildingOffice2Icon />;
    case 'book': return <BookOpenIcon />;
    case 'guide': return <AcademicCapIcon />;
    case 'route': return <MapIcon />;
    case 'help': return <QuestionMarkCircleIcon />;
    case 'megaphone': return <MegaphoneIcon />;
    case 'info': return <InformationCircleIcon />;
    case 'document': return <DocumentTextIcon />;
    default: return null;
  }
}


