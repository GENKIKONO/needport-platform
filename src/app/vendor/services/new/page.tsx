import EnsureVendorProfile from '@/components/vendor/EnsureVendorProfile';

export const dynamic = 'force-dynamic';

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">サービス・商品を登録</h1>

      <EnsureVendorProfile returnTo="/vendor/services/new">
        {/* ここに既存の登録フォームを配置。未実装ならプレースホルダでもOK */}
        <div className="rounded-md border p-4">
          <p className="text-sm text-gray-600">
            企業情報は登録済みです。ここにサービス登録フォームを配置します。
          </p>
        </div>
      </EnsureVendorProfile>
    </div>
  );
}
