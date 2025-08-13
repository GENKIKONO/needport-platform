import AdminBar from "@/components/admin/AdminBar";

export const dynamic = "force-dynamic";

export default function ExportsPage() {
  const exports = [
    {
      name: "ニーズ一覧",
      description: "すべてのニーズデータ（タイトル、概要、ステータスなど）",
      url: "/api/admin/export/needs.csv",
      filename: `needs-${new Date().toISOString().split("T")[0]}.csv`,
    },
    {
      name: "オファー一覧",
      description: "すべてのオファーデータ（提供者、金額、作成日時など）",
      url: "/api/admin/export/offers.csv",
      filename: `offers-${new Date().toISOString().split("T")[0]}.csv`,
    },
    {
      name: "参加予約一覧",
      description: "すべての参加予約データ（ユーザー、ステータス、作成日時など）",
      url: "/api/admin/export/prejoins.csv",
      filename: `prejoins-${new Date().toISOString().split("T")[0]}.csv`,
    },
    {
      name: "監査ログ",
      description: "システムの変更履歴（作成、更新、削除の記録）",
      url: "/api/admin/export/audit.csv",
      filename: `audit-${new Date().toISOString().split("T")[0]}.csv`,
    },
  ];

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('ダウンロードに失敗しました。');
    }
  };

  return (
    <div className="space-y-6">
      <AdminBar title="データエクスポート" />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">データエクスポート</h1>
          <p className="text-gray-400">
            システムのデータをCSV形式でダウンロードできます。ファイルはUTF-8エンコーディングで出力されます。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {exports.map((exportItem) => (
            <div key={exportItem.name} className="rounded-lg border p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-lg">{exportItem.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{exportItem.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(exportItem.url, exportItem.filename)}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
                >
                  CSV ダウンロード
                </button>
                
                <a
                  href={exportItem.url}
                  download={exportItem.filename}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  直接リンク
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
          <h3 className="font-medium text-blue-300 mb-2">注意事項</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• ファイルは現在のデータベースの状態を反映しています</li>
            <li>• 大量のデータがある場合、ダウンロードに時間がかかる場合があります</li>
            <li>• 監査ログは最新10,000件までエクスポートされます</li>
            <li>• ファイルはUTF-8エンコーディングで出力されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
