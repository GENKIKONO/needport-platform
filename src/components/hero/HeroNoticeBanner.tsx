export default function HeroNoticeBanner() {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-6">
      <div className="bg-white/90 backdrop-blur rounded-lg p-4 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-slate-700">
            新機能：事業者向け提案ツールがリリースされました
          </span>
          <a href="/guide/offer" className="text-sm text-sky-600 hover:underline ml-auto">
            詳しく見る →
          </a>
        </div>
      </div>
    </div>
  );
}
