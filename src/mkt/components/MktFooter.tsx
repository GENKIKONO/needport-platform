import Link from "next/link";
import { WaveDivider } from "@/components/WaveDivider";

export default function MktFooter() {
  return (
    <footer className="bg-neutral-50">
      <WaveDivider />
      <div className="section py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold mb-3">NeedPort</h3>
            <p className="text-sm text-neutral-600">
              ニーズの港。リアルな困りごとと業者の提案を安全に成立させるプラットフォーム。
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">サービス</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/mkt/how-it-works" className="hover:underline">使い方</Link></li>
              <li><Link href="/mkt/security" className="hover:underline">セキュリティ</Link></li>
              <li><Link href="/mkt/pricing" className="hover:underline">料金</Link></li>
              <li><Link href="/kaichu" className="hover:underline">海中（長期・保管ニーズ）</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">サポート</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/mkt/faq" className="hover:underline">よくある質問</Link></li>
              <li><Link href="/guide" className="hover:underline">ガイド</Link></li>
              <li><Link href="/contact" className="hover:underline">お問い合わせ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">会社情報</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/legal/privacy" className="hover:underline">プライバシーポリシー</Link></li>
              <li><Link href="/legal/terms" className="hover:underline">利用規約</Link></li>
              <li><Link href="/legal/tokusho" className="hover:underline">特定商取引法</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          © 2024 NeedPort. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
