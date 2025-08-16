"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NeedCard from "@/components/NeedCard";

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  tags_text: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchType, setSearchType] = useState<string>("");

  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }
      
      const data = await response.json();
      setResults(data.needs || []);
      setTotal(data.total || 0);
      setSearchType(data.searchType || "");
      
      // Update URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("q", searchQuery);
      router.replace(newUrl.pathname + newUrl.search);
      
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">検索</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="キーワードを入力..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "検索中..." : "検索"}
              </button>
            </div>
          </form>

          {/* Search Info */}
          {query && (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                <span>検索結果: {total}件</span>
                {searchType && (
                  <span className="ml-4">検索方式: {searchType === "fts" ? "全文検索" : "部分一致"}</span>
                )}
              </div>
              <div>
                検索クエリ: <span className="font-mono bg-gray-800 px-2 py-1 rounded">"{query}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-4 text-gray-400">検索中...</p>
          </div>
        ) : query && results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">検索結果が見つかりません</h3>
            <p className="text-gray-400 mb-6">
              「{query}」に一致するニーズが見つかりませんでした。
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• キーワードを変更してお試しください</p>
              <p>• より一般的な言葉で検索してください</p>
              <p>• スペルを確認してください</p>
            </div>
          </div>
        ) : query && results.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((need) => (
                <NeedCard
                  key={need.id}
                  need={{
                    id: need.id,
                    title: need.title,
                    summary: need.summary,
                    tags_text: need.tags_text,
                    created_at: need.created_at,
                    updated_at: need.updated_at,
                    status: need.status,
                    prejoin_count: 0,
                    offer_count: 0
                  }}
                  compact={true}
                />
              ))}
            </div>
            
            {total > results.length && (
              <div className="text-center py-6">
                <p className="text-gray-400">
                  表示中: {results.length}件 / 全{total}件
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  より詳細な検索結果を表示するには、検索条件を絞り込んでください。
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">検索を開始</h3>
            <p className="text-gray-400">
              キーワードを入力して、ニーズを検索してください。
            </p>
          </div>
        )}

        {/* Search Tips */}
        <div className="mt-12 bg-blue-900/20 border border-blue-500/40 rounded-lg p-6">
          <h3 className="font-medium text-blue-300 mb-3">検索のヒント</h3>
          <div className="text-sm text-blue-200 space-y-2">
            <p>• 3文字以上のキーワードで全文検索が有効になります</p>
            <p>• 短いキーワードは部分一致検索になります</p>
            <p>• タグ名やカテゴリでも検索できます</p>
            <p>• 複数のキーワードを組み合わせて検索できます</p>
          </div>
        </div>
      </div>
    </div>
  );
}
