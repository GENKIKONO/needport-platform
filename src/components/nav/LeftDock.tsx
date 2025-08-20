import { navGroups } from "./menuData";

function ShipIcon(props:{className?:string; "aria-hidden"?:boolean}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M3 15l9-5 9 5-9 5-9-5Z" />
      <path d="M12 4v6" />
    </svg>
  );
}

export default function LeftDock() {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto border-r bg-white">
      <div className="px-4 py-5">
        {/* 船ロゴのみ（絵文字不可） */}
        <div className="mb-6 flex items-center gap-2">
          <ShipIcon className="h-6 w-6 text-sky-600" aria-hidden />
          <span className="font-semibold">NeedPort</span>
        </div>

        <nav className="space-y-6">
          {navGroups.map((g) => (
            <div key={g.title}>
              <div className="text-xs text-gray-500 mb-2">{g.title}</div>
              <ul className="space-y-1">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <a className="block rounded px-3 py-2 hover:bg-gray-50" href={it.href}>
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
