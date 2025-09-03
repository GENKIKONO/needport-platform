"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  List, Plus, Building2, NotebookText, Compass, Map, HelpCircle,
  Megaphone, Info, FileText
} from "lucide-react";

function Item({ href, label, Icon }:{ href:string; label:string; Icon: React.ComponentType<any> }) {
  const p = usePathname() || "/";
  const active = p === href || p.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm
        ${active ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
    >
      <Icon aria-hidden className="w-4 h-4 shrink-0 stroke-[1.75]" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function Section({ title, children }:{title:string; children:React.ReactNode}) {
  return (
    <div className="px-3 py-3">
      <div className="px-1 pb-2 text-xs font-semibold text-slate-500">{title}</div>
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

export default function SideNav(){
  return (
    <nav className="py-3">
      <Section title='みんなの「欲しい」'>
        <Item href="/v2/needs"     label="ニーズ一覧"   Icon={List} />
        <Item href="/v2/needs/new" label="ニーズを投稿" Icon={Plus} />
      </Section>

      <Section title='企業の「できる」'>
        <Item href="/v2/vendors"           label="事業者登録" Icon={Building2} />
        <Item href="/v2/proposals/guide"   label="提案ガイド" Icon={NotebookText} />
      </Section>

      <Section title="ガイド">
        <Item href="/v2/guide"   label="使い方ガイド"   Icon={Compass} />
        <Item href="/v2/route"   label="サービス航海図" Icon={Map} />
        <Item href="/v2/faq"     label="よくある質問"   Icon={HelpCircle} />
      </Section>

      <Section title="サイト情報">
        <Item href="/v2/news"    label="お知らせ"         Icon={Megaphone} />
        <Item href="/about"      label="このサイトについて" Icon={Info} />
        <Item href="/terms"      label="利用規約"         Icon={FileText} />
      </Section>
    </nav>
  );
}
