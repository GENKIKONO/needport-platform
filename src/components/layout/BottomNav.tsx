'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [showToast, setShowToast] = useState(false);

  const navItems = [
    { href: '/', label: 'ホーム', icon: '🏠' },
    { href: '/needs', label: 'ニーズ', icon: '📋' },
    { href: '/needs/new', label: '投稿', icon: '✏️' },
    { href: '/me', label: 'マイページ', icon: '👤' },
  ];

  const handleClick = (item: typeof navItems[0]) => {
    if (item.href === '/me') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'text-brand-400'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Toast for disabled features */}
      {showToast && (
        <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-neutral-800 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">マイページは近日公開予定です</p>
        </div>
      )}
    </>
  );
}
