'use client';

export default function CTASection() {
  const handleCTAClick = (action: string) => {
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'serviceOverview_cta_click', {
        action,
        page: 'service-overview'
      });
    }
  };

  return (
    <section className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--c-blue-strong)]">さあ、始めましょう</h2>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          NeedPortで新しい可能性を見つけてください
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/needs/new" 
          className="inline-flex items-center justify-center px-6 py-3 bg-[var(--c-blue)] text-white rounded-lg hover:bg-[var(--c-blue-strong)] transition-colors"
          onClick={() => handleCTAClick('post_need')}
        >
          ニーズを投稿する
        </a>
        <a 
          href="/kaichu" 
          className="inline-flex items-center justify-center px-6 py-3 border border-[var(--c-border)] text-[var(--c-text)] rounded-lg hover:bg-[var(--c-bg)] transition-colors"
          onClick={() => handleCTAClick('view_kaichu')}
        >
          海中（保管ニーズ）を見る
        </a>
      </div>
    </section>
  );
}
