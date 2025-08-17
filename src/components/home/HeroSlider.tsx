'use client';
import { useState, useEffect } from 'react';
import Icon from '../Icon';

const slides = [
  {
    id: 1,
    title: 'ニーズ起点で、安心して出会える',
    subtitle: '困りごとから始まるマッチングOS',
    iconName: 'home',
    gradient: 'from-blue-600 to-emerald-600',
  },
  {
    id: 2,
    title: '最小摩擦で、最大の価値を',
    subtitle: '発注と受注をつなぐプラットフォーム',
    iconName: 'search',
    gradient: 'from-emerald-600 to-amber-600',
  },
  {
    id: 3,
    title: '信頼できるパートナーと',
    subtitle: '安全にビジネスを加速',
    iconName: 'company',
    gradient: 'from-amber-600 to-blue-600',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-96 md:h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          <div className="relative h-full flex items-center justify-center text-center text-white">
            <div className="max-w-4xl mx-auto px-6">
              <div className="mb-6 flex justify-center">
                <Icon name={slide.iconName} className="size-16 md:size-20 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide
                ? 'bg-white'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
