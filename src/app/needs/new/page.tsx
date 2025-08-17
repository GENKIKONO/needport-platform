'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NeedScale } from '@/lib/domain/need';
import { parseScale } from '@/lib/domain/need';
import NeedApprovalNote from '@/components/NeedApprovalNote';

export default function NewNeedPage() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<NeedScale>('personal');
  const [feeHint, setFeeHint] = useState('');
  const [useFreq, setUseFreq] = useState('');
  const [areaHint, setAreaHint] = useState('');
  const [step, setStep] = useState(1);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const dto = {
      title: String(f.get('title') || ''),
      summary: String(f.get('summary') || ''),
      min_people: f.get('min_people') ? Number(f.get('min_people')) : null,
      price_amount: f.get('price_amount') ? Number(f.get('price_amount')) : null,
      deadline: f.get('deadline') ? new Date(String(f.get('deadline'))).toISOString() : null,
      location: String(f.get('location') || ''),
      tags: (String(f.get('tags') || '').split(',').map(s=>s.trim()).filter(Boolean)) || [],
              scale,
        ...(scale === 'community' ? {
          macro_fee_hint: feeHint || null,
          macro_use_freq: useFreq || null,
          macro_area_hint: areaHint || null,
        } : {}),
      agree: f.get('agree') === 'on',
    };
    try {
      const res = await fetch('/api/needs', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify(dto) });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'failed');
      r.replace(`/needs/${json.id}`);
    } catch (e:any) {
      setError(e?.message ?? '送信に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container max-w-3xl space-y-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">ニーズを投稿</h1>
          <span className="text-sm text-neutral-400">ステップ {step}/2</span>
        </div>
        <div className="progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <NeedApprovalNote />

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">タイトル</label>
          <input name="title" required minLength={4} maxLength={80}
            className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" placeholder="例: 社内研修プログラム開発" />
        </div>

        <div>
          <label className="block text-sm mb-1">概要</label>
          <textarea name="summary" required minLength={10} maxLength={600} rows={6}
            className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" placeholder="目的/範囲/成果物のイメージなど（個人情報は書かない）" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">最低人数（任意）</label>
            <input name="min_people" type="number" min={1} max={999}
              className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" placeholder="例: 10" />
          </div>
          <div>
            <label className="block text-sm mb-1">目安価格（円, 任意）</label>
            <input name="price_amount" type="number" min={0} step={1000}
              className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" placeholder="例: 500000" />
          </div>
          <div>
            <label className="block text-sm mb-1">締切（任意）</label>
            <input name="deadline" type="date"
              className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">ニーズの種類 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`card p-4 cursor-pointer transition-colors ${
              scale === 'personal' ? 'border-brand-500 bg-brand-500/10' : 'border-white/20 hover:border-white/40'
            }`}>
              <input 
                type="radio" 
                name="scale" 
                value="personal"
                checked={scale==='personal'} 
                onChange={()=>setScale('personal')} 
                required
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  scale === 'personal' ? 'border-brand-500 bg-brand-500' : 'border-white/40'
                }`} />
                <div>
                  <div className="font-medium text-white">個人・小規模</div>
                  <div className="text-sm text-neutral-400">個人や小規模チーム向け</div>
                </div>
              </div>
            </label>
            <label className={`card p-4 cursor-pointer transition-colors ${
              scale === 'community' ? 'border-brand-500 bg-brand-500/10' : 'border-white/20 hover:border-white/40'
            }`}>
              <input 
                type="radio" 
                name="scale" 
                value="community"
                checked={scale==='community'} 
                onChange={()=>setScale('community')} 
                required
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  scale === 'community' ? 'border-brand-500 bg-brand-500' : 'border-white/40'
                }`} />
                <div>
                  <div className="font-medium text-white">企業・大規模</div>
                  <div className="text-sm text-neutral-400">企業や大規模プロジェクト向け</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {scale==='community' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">会費目安（任意）</label>
              <input 
                name="macro_fee_hint"
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" 
                value={feeHint} 
                onChange={e=>setFeeHint(e.target.value)} 
                placeholder="上限100万円 など"
                maxLength={120}
                aria-describedby="macro-fields-description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">利用頻度（任意）</label>
              <input 
                name="macro_use_freq"
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" 
                value={useFreq} 
                onChange={e=>setUseFreq(e.target.value)} 
                placeholder="月1回のイベント想定 など"
                maxLength={120}
                aria-describedby="macro-fields-description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">対象エリア（任意）</label>
              <input 
                name="macro_area_hint"
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" 
                value={areaHint} 
                onChange={e=>setAreaHint(e.target.value)} 
                placeholder="高知県内 など"
                maxLength={120}
                aria-describedby="macro-fields-description"
              />
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-400" id="macro-fields-description">
          ※ みんなごとを選ぶと会費目安などを設定できます
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">場所/対応エリア（任意）</label>
            <input name="location" maxLength={80}
              className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" placeholder="例: 全国/高知県" />
          </div>
          <div>
            <label className="block text-sm mb-1">タグ（カンマ区切り・任意）</label>
            <input name="tags"
              className="w-full rounded border border-neutral-700 bg-neutral-900 p-2" placeholder="例: 研修, オンライン, 教育" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="agree" required />
          投稿規約と個人情報非掲載の方針に同意します
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
            {loading ? '送信中…' : '投稿する'}
          </button>
          <a href="/" className="px-4 py-2 rounded border border-neutral-700">キャンセル</a>
        </div>
      </form>
    </main>
  );
}
