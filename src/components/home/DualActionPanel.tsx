"use client";
import { useState, useRef, useCallback } from "react";
import { MagnifyingGlassIcon as SearchIcon, PlusIcon } from "@/components/icons";
import AreaSelect from "@/components/fields/AreaSelect";

// フォームコンポーネント
function Select({ placeholder }: { placeholder: string }) {
  return (
    <select className="h-12 md:h-12.5 px-4 md:px-5 text-[15px] w-full border border-slate-200/40 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)] rounded-md">
      <option value="">{placeholder}</option>
      {placeholder === "エリアを選択" && (
        <>
          <option value="高知市">高知市</option>
          <option value="室戸市">室戸市</option>
          <option value="安芸市">安芸市</option>
          <option value="南国市">南国市</option>
          <option value="土佐市">土佐市</option>
          <option value="須崎市">須崎市</option>
          <option value="宿毛市">宿毛市</option>
          <option value="土佐清水市">土佐清水市</option>
          <option value="四万十市">四万十市</option>
          <option value="香南市">香南市</option>
          <option value="香美市">香美市</option>
        </>
      )}
      {placeholder === "カテゴリを選択" && (
        <>
          <option value="IT・システム">IT・システム</option>
          <option value="デザイン・クリエイティブ">デザイン・クリエイティブ</option>
          <option value="マーケティング">マーケティング</option>
          <option value="営業・販売">営業・販売</option>
          <option value="事務・管理">事務・管理</option>
          <option value="製造・技術">製造・技術</option>
          <option value="サービス">サービス</option>
          <option value="その他">その他</option>
        </>
      )}
    </select>
  );
}

function Input({ placeholder, name, required }: { placeholder: string; name?: string; required?: boolean }) {
  return (
    <input 
      name={name}
      type="text" 
      className="h-12 md:h-12.5 px-4 md:px-5 text-[15px] w-full border border-slate-200/40 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)] rounded-md" 
      placeholder={placeholder}
      required={required}
    />
  );
}



function Button({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" className={`bg-[var(--panel-blue-accent)] text-white font-semibold px-5 md:px-6 py-3 md:py-3.5 leading-6 rounded-md ${className}`}>
      {children}
    </button>
  );
}

export default function DualActionPanel() {
  const [tab, setTab] = useState<'find'|'post'>('find');
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((newTab: 'find'|'post') => {
    setTab(newTab);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentTab: 'find'|'post') => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newTab = currentTab === 'find' ? 'post' : 'find';
      setTab(newTab);
      // Focus the new tab
      const newTabElement = tabsRef.current?.querySelector(`button[data-tab="${newTab}"]`) as HTMLButtonElement;
      newTabElement?.focus();
    }
  }, []);

  return (
    <section className="relative mx-auto max-w-screen-xl px-4 sm:px-6">
      {/* ブルー背景 */}
      <div className="absolute inset-x-0 -top-6 h-[88px] sm:h-[104px] bg-[#CFE8FA] rounded-b-3xl" aria-hidden="true" />
      
      {/* 付箋タブ */}
      <div 
        ref={tabsRef}
        role="tablist" 
        aria-label="検索種別" 
        className="relative z-10 flex sm:flex-row flex-col justify-center gap-2 sm:gap-4"
      >
        {(['find', 'post'] as const).map((tabKey) => {
          const active = tab === tabKey;
          const label = tabKey === 'find' ? 'ニーズを探す' : 'ニーズを投稿';
          const Icon = tabKey === 'find' ? SearchIcon : PlusIcon;
          
          return (
            <button
              key={tabKey}
              data-tab={tabKey}
              role="tab"
              id={`tab-${tabKey}`}
              aria-controls={`panel-${tabKey}`}
              aria-selected={active}
              onClick={() => handleTabChange(tabKey)}
              onKeyDown={(e) => handleKeyDown(e, tabKey)}
              className={[
                "inline-flex items-center rounded-2xl px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                active
                  ? "bg-white text-slate-900 shadow-[0_6px_0_0_#9EC8E6] -mb-1"
                  : "bg-white/70 text-slate-600 shadow-sm hover:bg-white hover:shadow"
              ].join(' ')}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {label}
            </button>
          );
        })}
      </div>

      {/* フォームコンテナ */}
      <div className="relative z-0 -mt-2 sm:-mt-4">
        <div className="rounded-2xl bg-white shadow-lg p-4 sm:p-6">
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
          >
            {tab === 'find' ? <FindForm/> : <PostFormLite/>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* フォーム（ラベルはplaceholder内に寄せ、上下を1行に） */
function FindForm(){
  const [area, setArea] = useState("");

  return (
    <form action="/needs" className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="w-full sm:flex-1">
          <AreaSelect value={area} onChange={setArea} />
        </div>
        
        <div className="w-px h-6 bg-slate-300 sm:block hidden" aria-hidden="true" />
        
        <div className="w-full sm:flex-1">
          <Select placeholder="カテゴリを選択"/>
        </div>
      </div>
      
      <Input placeholder="キーワード（例：Webサイト制作、デザイン…）"/>
      
      <div className="pt-2">
        <Button className="w-full sm:w-auto">検索する</Button>
      </div>
    </form>
  );
}

function PostFormLite() {
  return (
    <form action="/post" className="space-y-3 sm:space-y-4">
      <Input 
        name="title" 
        placeholder="タイトル（まずは件名だけでもOK）"
        required
      />
      <div className="pt-2">
        <Button className="w-full sm:w-auto">投稿をはじめる</Button>
      </div>
    </form>
  );
}
