import { getFlags } from '@/lib/admin/flags';
import LeftDock from '@/components/nav/LeftDock';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const flags = await getFlags();

  // PCで左ドック常時展開が有効な場合
  if (flags.twoPanePublicEnabled) {
    return (
      <div className="lg:grid lg:grid-cols-[300px,1fr] lg:h-screen">
        {/* 左ドック - PCのみ常時表示 */}
        <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:bg-white">
          <LeftDock />
        </div>
        
        {/* 右メインコンテンツ */}
        <main className="lg:overflow-y-auto lg:pb-[96px]">
          {children}
        </main>
      </div>
    );
  }

  // モバイルまたは左ドック無効時は従来のレイアウト
  return <main className="pb-[96px]">{children}</main>;
}
