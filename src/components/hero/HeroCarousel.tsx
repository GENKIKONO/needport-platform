'use client';
import { useEffect, useRef, useState } from 'react';

const slides = [
  { id: 'needport', title: 'NeedPort', sub: '欲しい暮らし、10人で叶える。', cls: 'from-[#2b62ff] to-[#14b8a6]' },
  { id: 'empathy',  title: '共感の力',   sub: 'ひとりの「欲しい」がみんなの「必要」に。', cls: 'from-[#ef4444] to-[#f59e0b]' },
  { id: 'realize',  title: '実現する力', sub: '需要が見えるから、安心して提供できる。',   cls: 'from-[#10b981] to-[#059669]' },
];

export default function HeroCarousel(){
  const [i, setI] = useState(0);
  const timer = useRef<number | null>(null);
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) return;
    timer.current && window.clearInterval(timer.current);
    timer.current = window.setInterval(() => setI(v => (v + 1) % slides.length), 5000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [prefersReduced]);

  return (
    <section className="np-fullbleed-left np-square">
      <div className="relative overflow-hidden rounded-none">
        <div className="min-h-[280px] md:min-h-[440px] pt-10 pb-8 sm:pt-12 sm:pb-10">
          {slides.map((s, idx) => (
            <div key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br ${s.cls} ${idx===i?'opacity-100':'opacity-0'}`}>
              <div className="h-full flex flex-col items-center justify-center text-white text-center px-6">
                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight drop-shadow-sm">{s.title}</h1>
                <p className="mt-3 text-lg lg:text-2xl opacity-95">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
        {/* ドット */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 mt-3 mb-1">
          {slides.map((_, idx) => (
            <button key={idx} aria-label={`slide ${idx+1}`}
              onClick={()=>setI(idx)}
              className={`h-2 w-2 rounded-full ${idx===i?'bg-white':'bg-white/50'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
