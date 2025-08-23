import Link from 'next/link';
import { u } from '@/components/ui/u';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `/needs?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 現在ページを中心に表示
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-8">
      <div className="flex items-center justify-center space-x-2">
        {/* 前へボタン */}
        {currentPage > 1 && (
          <Link
            href={createPageUrl(currentPage - 1)}
            className={`${u.btn} ${u.btnGhost} ${u.focus} min-w-[60px]`}
            aria-label="前のページへ"
          >
            前へ
          </Link>
        )}
        
        {/* ページ番号 */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-[var(--c-text-muted)]"
                >
                  ...
                </span>
              );
            }
            
            const pageNum = page as number;
            const isCurrent = pageNum === currentPage;
            
            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-[var(--c-blue)] text-white'
                    : 'text-[var(--c-text)] hover:bg-[var(--c-blue-bg)]'
                } ${u.focus}`}
                aria-label={`${pageNum}ページへ`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>
        
        {/* 次へボタン */}
        {currentPage < totalPages && (
          <Link
            href={createPageUrl(currentPage + 1)}
            className={`${u.btn} ${u.btnGhost} ${u.focus} min-w-[60px]`}
            aria-label="次のページへ"
          >
            次へ
          </Link>
        )}
      </div>
      
      {/* ページ情報 */}
      <div className="mt-4 text-center text-sm text-[var(--c-text-muted)]">
        {totalPages}ページ中 {currentPage}ページ目
      </div>
    </div>
  );
}
