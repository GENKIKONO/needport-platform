'use client';
import { useState, useMemo } from 'react';
import NeedCardNew from '@/components/NeedCardNew';
import { getSampleNeeds, type SampleNeed } from '@/lib/sampleNeeds';

export const dynamic = 'force-dynamic';

const areas = ['全国対応', '東京都', '関東圏', '関西圏', 'その他'];
const categories = ['Webデザイン', 'システム開発', '動画制作', '翻訳', '研修', 'イベント', 'マーケティング'];

export default function NeedsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');

  const allNeeds = getSampleNeeds();

  const filteredNeeds = useMemo(() => {
    let filtered = allNeeds;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(need =>
        need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        need.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Area filter
    if (selectedArea) {
      filtered = filtered.filter(need => need.area === selectedArea);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(need => need.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'popular') {
        return b.currentPeople - a.currentPeople;
      } else {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
    });

    return filtered;
  }, [allNeeds, searchQuery, selectedArea, selectedCategory, sortBy]);

  return (
    <div className="container py-8">
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="ニーズを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-6">
        {/* Area Filter */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">エリア</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(selectedArea === area ? '' : area)}
                className={`chip transition-colors ${
                  selectedArea === area
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">カテゴリ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                className={`chip transition-colors ${
                  selectedCategory === category
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">並び順</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('new')}
              className={`btn btn-ghost ${
                sortBy === 'new' ? 'bg-brand-500 text-white' : ''
              }`}
            >
              新着
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`btn btn-ghost ${
                sortBy === 'popular' ? 'bg-brand-500 text-white' : ''
              }`}
            >
              人気
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-neutral-400">
          {filteredNeeds.length}件のニーズが見つかりました
        </p>
      </div>

      {/* Needs Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNeeds.map((need) => (
          <NeedCardNew
            key={need.id}
            id={need.id}
            title={need.title}
            description={need.description}
            category={need.category}
            area={need.area}
            targetPeople={need.targetPeople}
            currentPeople={need.currentPeople}
            deadline={need.deadline}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredNeeds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-white mb-2">ニーズが見つかりませんでした</h3>
          <p className="text-neutral-400">
            検索条件を変更してお試しください
          </p>
        </div>
      )}
    </div>
  );
}
