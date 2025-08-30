import { Suspense } from "react";
import SearchTabs from "@/components/search/SearchTabs";

interface SearchParams {
  prefecture?: string;
  industry?: string;
  name?: string;
}

interface CompaniesPageProps {
  searchParams: SearchParams;
}

export default function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const { prefecture, industry, name } = searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 検索フォーム */}
      <SearchTabs initialTab="company" />

      {/* 検索結果エリア */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">企業検索</h1>
          {(prefecture || industry || name) && (
            <div className="text-sm text-gray-600">
              検索条件: 
              {prefecture && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{prefecture}</span>}
              {industry && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{industry}</span>}
              {name && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{name}</span>}
            </div>
          )}
        </div>

        <Suspense fallback={<CompaniesLoading />}>
          <CompaniesResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function CompaniesLoading() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

function CompaniesResults({ searchParams }: { searchParams: SearchParams }) {
  // 実際の実装では、ここでAPIからデータを取得
  const mockCompanies = [
    {
      id: 1,
      name: "株式会社テックイノベーション",
      industry: "IT・システム",
      prefecture: "東京都",
      employees: "50-100名",
      description: "最新技術を活用したソリューションを提供しています。"
    },
    {
      id: 2,
      name: "デザインクリエイト合同会社",
      industry: "デザイン・クリエイティブ",
      prefecture: "大阪府",
      employees: "10-30名",
      description: "ブランディングからWebデザインまで幅広く対応。"
    },
    {
      id: 3,
      name: "マーケティングソリューションズ株式会社",
      industry: "マーケティング",
      prefecture: "愛知県",
      employees: "30-50名",
      description: "データドリブンなマーケティング戦略をご提案します。"
    }
  ];

  // フィルタリング（実際のAPIでは不要）
  let filteredCompanies = mockCompanies;
  if (searchParams.prefecture) {
    filteredCompanies = filteredCompanies.filter(c => c.prefecture.includes(searchParams.prefecture!));
  }
  if (searchParams.industry) {
    filteredCompanies = filteredCompanies.filter(c => c.industry.includes(searchParams.industry!));
  }
  if (searchParams.name) {
    filteredCompanies = filteredCompanies.filter(c => 
      c.name.toLowerCase().includes(searchParams.name!.toLowerCase())
    );
  }

  if (filteredCompanies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">該当する企業が見つかりませんでした</div>
        <p className="text-sm text-gray-400">検索条件を変更してお試しください</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        {filteredCompanies.length}件の企業が見つかりました
      </div>
      
      {filteredCompanies.map((company) => (
        <div key={company.id} className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-semibold text-gray-900">{company.name}</h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{company.industry}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{company.prefecture}</span>
            </div>
          </div>
          <div className="text-gray-600 mb-2">従業員数: {company.employees}</div>
          <p className="text-gray-700">{company.description}</p>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              詳細を見る
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              お気に入り
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
