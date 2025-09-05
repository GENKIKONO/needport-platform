import Link from 'next/link'

const Item = ({href, label, icon}:{href:string; label:string; icon:JSX.Element}) => (
  <Link href={href} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-slate-50">
    <span className="text-sky-600">{icon}</span><span>{label}</span>
  </Link>
)

export default function LeftDock(){
  return (
    <nav className="text-sm space-y-5">
      <section>
        <div className="px-2 pb-1 text-xs text-slate-500">みんなの『欲しい』</div>
        <Item href="/needs" label="ニーズ一覧" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="currentColor"/></svg>} />
        <Item href="/needs/new" label="ニーズを投稿" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>} />
      </section>
      <section>
        <div className="px-2 pb-1 text-xs text-slate-500">企業の『できる』</div>
        <Item href="/vendors/new" label="事業者登録" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 20V8l9-5 9 5v12H3z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} />
        <Item href="/me/vendor/guide" label="提案ガイド" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 19h16M7 4h10a2 2 0 012 2v11H5V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} />
        <Item href="/sea" label="海中（ニーズ保管庫）" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M2 14c3 0 3-2 6-2s3 2 6 2 3-2 6-2v6H2z" fill="currentColor"/></svg>} />
      </section>
      <section>
        <div className="px-2 pb-1 text-xs text-slate-500">ガイド</div>
        <Item href="/roadmap" label="サービス航海図" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 19l4-10 4 4 4-8 4 14" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} />
        <Item href="/news" label="お知らせ" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM8 9h8M8 13h8" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} />
      </section>
      <section>
        <div className="px-2 pb-1 text-xs text-slate-500">アカウント</div>
        <Item href="/me" label="マイページ" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-8 9a8 8 0 1116 0H4z" fill="currentColor"/></svg>} />
        <Item href="/login" label="ログイン" icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M10 12h10M14 8l-4 4 4 4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} />
      </section>
    </nav>
  )
}
