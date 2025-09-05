'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = { mode?: 'desktop'|'mobile'; onNavigate?: () => void };
const Item = ({ href, children, active, onClick }:{
  href: string; children: React.ReactNode; active?: boolean; onClick?: ()=>void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`block rounded px-3 py-2 text-sm ${active ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50'}`}
  >
    {children}
  </Link>
);

export default function LeftDock({ mode='desktop', onNavigate }: Props) {
  const pathname = usePathname();
  const isActive = (p:string) => pathname === p || pathname?.startsWith(p + '/');

  return (
    <nav className={mode==='desktop' ? 'p-3' : ''} aria-label="サイドナビゲーション">
      <Section title="みんなの『欲しい』">
        <Item href="/needs" active={isActive('/needs')} onClick={onNavigate}>ニーズ一覧</Item>
        <Item href="/needs/new" active={isActive('/needs/new')} onClick={onNavigate}>ニーズを投稿</Item>
      </Section>

      <Section title="企業の『できる』">
        <Item href="/vendors/new" active={isActive('/vendors/new')} onClick={onNavigate}>事業者登録</Item>
        <Item href="/me/vendor/guide" active={isActive('/me/vendor/guide')} onClick={onNavigate}>提案ガイド</Item>
        <Item href="/sea" active={isActive('/sea')} onClick={onNavigate}>海中（ニーズ保管庫）</Item>
      </Section>

      <Section title="サイト情報">
        <Item href="/roadmap" active={isActive('/roadmap')} onClick={onNavigate}>サービス航海図</Item>
        <Item href="/faq" active={isActive('/faq')} onClick={onNavigate}>よくある質問</Item>
        <Item href="/news" active={isActive('/news')} onClick={onNavigate}>お知らせ</Item>
        <Item href="/info" active={isActive('/info')} onClick={onNavigate}>このサイトについて</Item>
      </Section>
    </nav>
  );
}

function Section({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="px-3 py-2 text-xs font-semibold text-slate-500">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
