"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Briefcase, MapPin } from "lucide-react";
import type { SearchTabsProps, SearchTabType, CompanyQuery, JobQuery } from "@/types/search";
import { tabActive, tabInactive, tabBase, barBg, searchButton, formCard, iconColor } from "@/components/ui/tabStyles";

// ダミーマスタデータ
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const INDUSTRIES = [
  "IT・システム", "デザイン・クリエイティブ", "マーケティング", "営業・販売",
  "事務・管理", "製造・技術", "サービス", "小売", "金融", "医療", "教育", "その他"
];

const OCCUPATIONS = [
  "エンジニア", "デザイナー", "マーケター", "営業", "事務", "製造",
  "サービス", "販売", "経営・管理", "医療", "教育", "その他"
];

export default function SearchTabs({
  initialTab = "company",
  className = ""
}: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState<SearchTabType>(initialTab);
  const [companyQuery, setCompanyQuery] = useState<CompanyQuery>({});
  const [jobQuery, setJobQuery] = useState<JobQuery>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTabChange = useCallback((newTab: SearchTabType) => {
    setActiveTab(newTab);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentTab: SearchTabType) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newTab = currentTab === 'company' ? 'job' : 'company';
      setActiveTab(newTab);
      // Focus the new tab
      const newTabElement = tabsRef.current?.querySelector(`button[data-tab="${newTab}"]`) as HTMLButtonElement;
      newTabElement?.focus();
    }
  }, []);

  const handleCompanySearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (companyQuery.prefecture) params.set('prefecture', companyQuery.prefecture);
    if (companyQuery.industry) params.set('industry', companyQuery.industry);
    if (companyQuery.name) params.set('name', companyQuery.name);
    
    router.push(`/companies${params.toString() ? `?${params.toString()}` : ''}`);
  }, [companyQuery, router]);

  const handleJobSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (jobQuery.prefecture) params.set('prefecture', jobQuery.prefecture);
    if (jobQuery.occupation) params.set('occupation', jobQuery.occupation);
    if (jobQuery.keyword) params.set('q', jobQuery.keyword);
    
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  }, [jobQuery, router]);

  const tabs = [
    { key: 'company' as const, label: '企業を探す', icon: Building2 },
    { key: 'job' as const, label: '求人を探す', icon: Search }
  ];

  return (
    <section className={`${barBg} pb-8 ${className}`}>
      {/* タブ */}
      <div 
        ref={tabsRef}
        role="tablist"
        aria-label="検索種別"
        className="flex max-w-4xl mx-auto pt-6 px-4 gap-2 sm:flex-row flex-col"
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              data-tab={key}
              role="tab"
              id={`search-tab-${key}`}
              aria-controls={`search-panel-${key}`}
              aria-selected={isActive}
              onClick={() => handleTabChange(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              className={`${tabBase} flex-1 ${
                isActive ? tabActive : tabInactive
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          );
        })}
      </div>

      {/* 検索フォーム */}
      <div className="max-w-4xl mx-auto mt-4 px-4">
        <div className={formCard}>
          {activeTab === 'company' ? (
            <div
              role="tabpanel"
              id="search-panel-company"
              aria-labelledby="search-tab-company"
            >
              <form onSubmit={handleCompanySearch} className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="flex items-center bg-white rounded-lg border px-3 py-2 flex-1 w-full">
                    <MapPin className={`w-4 h-4 ${iconColor} mr-2 flex-shrink-0`} />
                    <select 
                      className="flex-1 outline-none"
                      value={companyQuery.prefecture || ''}
                      onChange={(e) => setCompanyQuery(prev => ({ ...prev, prefecture: e.target.value || undefined }))}
                    >
                      <option value="">所在地を選ぶ</option>
                      {PREFECTURES.map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                  </div>
                  
                  <span className="text-gray-400 hidden sm:inline-block">×</span>
                  
                  <div className="flex items-center bg-white rounded-lg border px-3 py-2 flex-1 w-full">
                    <Briefcase className={`w-4 h-4 ${iconColor} mr-2 flex-shrink-0`} />
                    <select 
                      className="flex-1 outline-none"
                      value={companyQuery.industry || ''}
                      onChange={(e) => setCompanyQuery(prev => ({ ...prev, industry: e.target.value || undefined }))}
                    >
                      <option value="">業種を選ぶ</option>
                      {INDUSTRIES.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    type="submit"
                    className={searchButton}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    検索
                  </button>
                </div>
                
                <div className="flex items-center bg-white rounded-lg border px-3 py-2">
                  <input
                    type="text"
                    placeholder="会社名"
                    className="flex-1 outline-none placeholder-gray-400"
                    value={companyQuery.name || ''}
                    onChange={(e) => setCompanyQuery(prev => ({ ...prev, name: e.target.value || undefined }))}
                  />
                  <button type="submit" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
                    <Search className={`w-5 h-5 ${iconColor}`} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500">
                  ※会社名のみを入力してください（株式会社・有限会社等法人形態は入力不要です）
                </p>
              </form>
            </div>
          ) : (
            <div
              role="tabpanel"
              id="search-panel-job"
              aria-labelledby="search-tab-job"
            >
              <form onSubmit={handleJobSearch} className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="flex items-center bg-white rounded-lg border px-3 py-2 flex-1 w-full">
                    <MapPin className={`w-4 h-4 ${iconColor} mr-2 flex-shrink-0`} />
                    <select 
                      className="flex-1 outline-none"
                      value={jobQuery.prefecture || ''}
                      onChange={(e) => setJobQuery(prev => ({ ...prev, prefecture: e.target.value || undefined }))}
                    >
                      <option value="">所在地を選ぶ</option>
                      {PREFECTURES.map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                  </div>
                  
                  <span className="text-gray-400 hidden sm:inline-block">×</span>
                  
                  <div className="flex items-center bg-white rounded-lg border px-3 py-2 flex-1 w-full">
                    <Briefcase className={`w-4 h-4 ${iconColor} mr-2 flex-shrink-0`} />
                    <select 
                      className="flex-1 outline-none"
                      value={jobQuery.occupation || ''}
                      onChange={(e) => setJobQuery(prev => ({ ...prev, occupation: e.target.value || undefined }))}
                    >
                      <option value="">職種を選ぶ</option>
                      {OCCUPATIONS.map(occupation => (
                        <option key={occupation} value={occupation}>{occupation}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    type="submit"
                    className={searchButton}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    検索
                  </button>
                </div>
                
                <div className="flex items-center bg-white rounded-lg border px-3 py-2">
                  <input
                    type="text"
                    placeholder="キーワード"
                    className="flex-1 outline-none placeholder-gray-400"
                    value={jobQuery.keyword || ''}
                    onChange={(e) => setJobQuery(prev => ({ ...prev, keyword: e.target.value || undefined }))}
                  />
                  <button type="submit" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
                    <Search className={`w-5 h-5 ${iconColor}`} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500">
                  ※職種やスキルに関するキーワードを入力してください
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
