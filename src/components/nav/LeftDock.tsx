import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-3">
      <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">{title}</div>
      <nav className="space-y-2">{children}</nav>
    </section>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-sky-700 hover:bg-sky-50 hover:underline"
    >
      {children}
    </Link>
  );
}

/** 左サイドに固定表示するナビ（モバイルでは Header 内のドロワーで流用） */
export default function LeftDock() {
  return (
    <div className="h-[calc(100vh-56px)] w-64 overflow-y-auto bg-white">
      <Section title="みんなの『欲しい』">
        <NavItem href="/needs">ニーズ一覧</NavItem>
        <NavItem href="/needs/new">ニーズを投稿</NavItem>
      </Section>

      <Section title="企業の『できる』">
        <NavItem href="/vendor/register">事業者登録</NavItem>
        <NavItem href="/me/vendor/guide">提案ガイド</NavItem>
        <NavItem href="/sea">海中（ニーズ保管庫）</NavItem>
      </Section>

      <Section title="ガイド">
        {/* 航海図は消さない（あなたのアイデンティティ） */}
        <NavItem href="/roadmap">サービス航海図</NavItem>
        <NavItem href="/faq">よくある質問</NavItem>
      </Section>

      <Section title="サイト情報">
        <NavItem href="/news">お知らせ</NavItem>
        <NavItem href="/info">このサイトについて</NavItem>
      </Section>
    </div>
  );
}