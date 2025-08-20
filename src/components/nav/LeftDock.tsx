"use client";
import Link from "next/link";
import { MENU } from "./menuData";
import Logo from "@/components/brand/Logo";
import { 
  HomeIcon, 
  RectangleStackIcon, 
  PlusCircleIcon, 
  BuildingOfficeIcon, 
  BookOpenIcon, 
  InformationCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  MapIcon
} from "@heroicons/react/24/outline";

export default function LeftDock() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:h-dvh lg:sticky lg:top-0 lg:overflow-y-auto border-r bg-white">
      {/* ロゴ（船）/サイト名 */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Logo className="w-7 h-7" />
        <span className="font-semibold text-[var(--ink-900)]">NeedPort</span>
      </div>
      
      {/* メニュー（アイコン+テキスト） */}
      <nav className="flex-1 px-2 py-4 space-y-6">
        {MENU.map(g => (
          <div key={g.title}>
            <div className="px-2 text-xs font-semibold text-[var(--ink-500)] mb-2">{g.title}</div>
            <ul className="space-y-1">
              {g.items.map(i => (
                <li key={i.href}>
                  <Link className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--blue-100)] hover:text-[var(--blue-700)] transition-colors" href={i.href}>
                    {i.icon && <span className="w-4 h-4 text-[var(--blue-600)] stroke-[1.8]">{getIcon(i.icon)}</span>}
                    <span className="font-medium md:font-semibold text-[15px] text-[var(--ink-900)]">{i.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
    case 'list': return <ListIcon />;
    case 'plus': return <PlusIcon />;
    case 'building': return <BuildingIcon />;
    case 'book': return <BookIcon />;
    case 'guide': return <GuideIcon />;
    case 'route': return <RouteIcon />;
    case 'help': return <HelpIcon />;
    case 'megaphone': return <MegaphoneIcon />;
    case 'info': return <InfoIcon />;
    case 'document': return <DocumentIcon />;
    default: return null;
  }
}

function ListIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>; }
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>; }
function BuildingIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>; }
function BookIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V6.5A2.5 2.5 0 0 1 6.5 4H20v15.5"/></svg>; }
function GuideIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M9 12l2 2 4-4M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/></svg>; }
function RouteIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M3 15l9-5 9 5-9 5-9-5Z"/></svg>; }
function HelpIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>; }
function DocumentIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>; }
function MegaphoneIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M3 11l19-7-7 19-2-8-8-2z"/></svg>; }
function InfoIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4M12 8h.01"/></svg>; }
