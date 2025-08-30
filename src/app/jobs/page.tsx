import { Suspense } from "react";
import SearchTabs from "@/components/search/SearchTabs";

interface SearchParams {
  prefecture?: string;
  occupation?: string;
  q?: string;
}

interface JobsPageProps {
  searchParams: SearchParams;
}

export default function JobsPage({ searchParams }: JobsPageProps) {
  const { prefecture, occupation, q: keyword } = searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 検索フォーム */}
      <SearchTabs initialTab="job" />

      {/* 検索結果エリア */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">求人検索</h1>
          {(prefecture || occupation || keyword) && (
            <div className="text-sm text-gray-600">
              検索条件: 
              {prefecture && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{prefecture}</span>}
              {occupation && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{occupation}</span>}
              {keyword && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">{keyword}</span>}
            </div>
          )}
        </div>

        <Suspense fallback={<JobsLoading />}>
          <JobsResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function JobsLoading() {
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

function JobsResults({ searchParams }: { searchParams: SearchParams }) {
  // 実際の実装では、ここでAPIからデータを取得
  const mockJobs = [
    {
      id: 1,
      title: "フロントエンドエンジニア",
      company: "株式会社テックイノベーション",
      occupation: "エンジニア",
      prefecture: "東京都",
      salary: "400万円〜600万円",
      type: "正社員",
      description: "React/TypeScriptを使用したWebアプリケーション開発をお任せします。"
    },
    {
      id: 2,
      title: "UIデザイナー",
      company: "デザインクリエイト合同会社",
      occupation: "デザイナー",
      prefecture: "大阪府",
      salary: "350万円〜500万円",
      type: "正社員",
      description: "ユーザー体験を重視したWebサイト・アプリのUIデザインを担当。"
    },
    {
      id: 3,
      title: "デジタルマーケター",
      company: "マーケティングソリューションズ株式会社",
      occupation: "マーケター",
      prefecture: "愛知県",
      salary: "380万円〜550万円",
      type: "正社員",
      description: "SNS運用、Web広告運用、コンテンツマーケティングを担当。"
    }
  ];

  // フィルタリング（実際のAPIでは不要）
  let filteredJobs = mockJobs;
  if (searchParams.prefecture) {
    filteredJobs = filteredJobs.filter(j => j.prefecture.includes(searchParams.prefecture!));
  }
  if (searchParams.occupation) {
    filteredJobs = filteredJobs.filter(j => j.occupation.includes(searchParams.occupation!));
  }
  if (searchParams.q) {
    filteredJobs = filteredJobs.filter(j => 
      j.title.toLowerCase().includes(searchParams.q!.toLowerCase()) ||
      j.description.toLowerCase().includes(searchParams.q!.toLowerCase())
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">該当する求人が見つかりませんでした</div>
        <p className="text-sm text-gray-400">検索条件を変更してお試しください</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        {filteredJobs.length}件の求人が見つかりました
      </div>
      
      {filteredJobs.map((job) => (
        <div key={job.id} className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h2>
              <p className="text-gray-600">{job.company}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{job.occupation}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{job.prefecture}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">{job.type}</span>
            </div>
          </div>
          <div className="text-gray-600 mb-2 font-medium">給与: {job.salary}</div>
          <p className="text-gray-700 mb-4">{job.description}</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              応募する
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
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
