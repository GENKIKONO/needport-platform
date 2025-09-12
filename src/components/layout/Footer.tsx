import Link from "next/link";
import { BRAND } from '@/lib/constants/brand';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* サービス情報 */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span className="text-xl font-bold">{BRAND.NAME}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-base">
                {BRAND.TAGLINE}
              </p>
            </div>

            {/* サービス */}
            <div>
              <h3 className="text-lg font-semibold mb-4">サービス</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/needs" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    ニーズ一覧
                  </Link>
                </li>
                <li>
                  <Link href="/me" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    マイページ
                  </Link>
                </li>
                <li>
                  <Link href="/me/vendor" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    事業者向け
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    サービスについて
                  </Link>
                </li>
              </ul>
            </div>

            {/* サポート */}
            <div>
              <h3 className="text-lg font-semibold mb-4">サポート</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    ヘルプ・よくある質問
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    ご利用ガイド
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    安全・安心への取り組み
                  </Link>
                </li>
              </ul>
            </div>

            {/* 法的情報 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">法的情報</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/(public)/legal/terms" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/(public)/legal/privacy" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/(public)/legal/tokushoho" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    特定商取引法に基づく表記
                  </Link>
                </li>
                <li>
                  <Link href="/company" className="text-slate-300 hover:text-blue-400 transition-colors text-base">
                    運営会社
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 区切り線 */}
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-slate-400 text-base">
                {BRAND.COPYRIGHT}
              </div>
              <div className="flex items-center gap-6">
                <div className="text-slate-400 text-base">
                  {BRAND.DESCRIPTION}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
