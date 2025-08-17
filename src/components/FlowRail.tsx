'use client';
import { useEffect, useRef, useState } from 'react';
import { FileText, Handshake, ShieldCheck, Square, CreditCard, Ship } from 'lucide-react';

const steps = [
  { icon: FileText, label: '投稿' },
  { icon: Handshake, label: '提案' },
  { icon: ShieldCheck, label: '承認' },
  { icon: Square, label: 'ルーム' },
  { icon: CreditCard, label: '支払い' },
];

export default function FlowRail() {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => e.forEach(v => v.isIntersecting && setPlay(true)),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="np-card overflow-hidden">
      {/* レール（PC=5等幅 / SP=横スクロール） */}
      <div className="relative">
        <div className="hidden md:grid grid-cols-5 gap-0">
          {steps.map((s, i) => (
            <div key={i} className="px-4 py-5 text-center">
              <s.icon className="mx-auto h-6 w-6 text-blue-600" />
              <div className="mt-2 text-sm font-medium text-neutral-700">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-none">
          <div className="flex min-w-[620px]">
            {steps.map((s, i) => (
              <div key={i} className="w-[20%] shrink-0 px-3 py-4 text-center snap-center">
                <s.icon className="mx-auto h-6 w-6 text-blue-600" />
                <div className="mt-1 text-xs font-medium text-neutral-700">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 船（レール上を横切る） */}
        <div className="absolute left-0 right-0 top-0 h-[72px] md:h-[88px] pointer-events-none">
          <div className={`ship-track ${play ? 'play' : ''}`}>
            <Ship aria-hidden className="ship-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
