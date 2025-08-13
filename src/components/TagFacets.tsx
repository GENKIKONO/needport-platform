'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface TagFacetsProps {
  tags: { tag: string; count: number }[];
  selectedTags: string[];
}

export default function TagFacets({ tags, selectedTags }: TagFacetsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const currentTags = params.getAll('tag');
    
    if (currentTags.includes(tag)) {
      // Remove tag
      const newTags = currentTags.filter(t => t !== tag);
      params.delete('tag');
      newTags.forEach(t => params.append('tag', t));
    } else {
      // Add tag
      params.append('tag', tag);
    }
    
    // Reset to page 1 when changing filters
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllTags = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tag');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-sm text-gray-400">人気タグ:</span>
        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
            }`}
          >
            {tag} ({count})
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="px-3 py-1 text-sm rounded-full bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors"
          >
            すべてクリア
          </button>
        )}
      </div>
    </div>
  );
}
