import AdminBar from "@/components/admin/AdminBar";
// import { CheckIcon } from '@/components/icons';

export const dynamic = "force-dynamic";

interface HealthCheck {
  name: string;
  status: "ok" | "error" | "warning";
  message: string;
  details?: any;
}

interface HealthResponse {
  ok: boolean;
  status: string;
  timestamp: string;
  checks: HealthCheck[];
}

async function getHealthStatus(): Promise<HealthResponse> {
  try {
    const response = await fetch(`/api/health`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch health status:", error);
    return {
      ok: false,
      status: "error",
      timestamp: new Date().toISOString(),
      checks: [{
        name: "Health API",
        status: "error",
        message: "Failed to fetch health status",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      }]
    };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "ok":
      return "bg-green-600/20 border-green-500/40 text-green-300";
    case "warning":
      return "bg-yellow-600/20 border-yellow-500/40 text-yellow-300";
    case "error":
      return "bg-red-600/20 border-red-500/40 text-red-300";
    default:
      return "bg-gray-600/20 border-gray-500/40 text-gray-300";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "ok":
      return <CheckIcon className="w-4 h-4 text-green-600" />;
    case "warning":
      return "⚠";
    case "error":
      return "✗";
    default:
      return "?";
  }
}

export default async function HealthPage() {
  const health = await getHealthStatus();
  
  const buildInfo = {
    nodeEnv: process.env.NODE_ENV || "development",
    buildSha: process.env.NEXT_PUBLIC_BUILD_SHA || "not set",
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <AdminBar title="システムヘルス" />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">システムヘルス</h1>
          <p className="text-gray-400">
            システムの各コンポーネントの状態を確認できます。
          </p>
        </div>

        {/* Overall Status */}
        <div className={`mb-6 p-4 rounded-lg border ${getStatusColor(health.status)}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStatusIcon(health.status)}</span>
            <div>
              <h2 className="font-medium text-lg">
                システム状態: {health.status === "ok" ? "正常" : health.status === "warning" ? "警告" : "エラー"}
              </h2>
              <p className="text-sm opacity-80">
                最終更新: {new Date(health.timestamp).toLocaleString("ja-JP")}
              </p>
            </div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {health.checks.map((check) => (
            <div key={check.name} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{check.name}</h3>
                <span className="text-lg">{getStatusIcon(check.status)}</span>
              </div>
              <p className="text-sm opacity-80 mb-3">{check.message}</p>
              
              {check.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer hover:opacity-80">詳細</summary>
                  <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* Build Information */}
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-3">ビルド情報</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">環境:</span>
              <span className="font-mono">{buildInfo.nodeEnv}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ビルドハッシュ:</span>
              <span className="font-mono">{buildInfo.buildSha}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">生成時刻:</span>
              <span className="font-mono">{new Date(buildInfo.timestamp).toLocaleString("ja-JP")}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
          >
            再読み込み
          </button>
          
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-blue-500/40 bg-blue-600/20 px-4 py-2 text-sm text-blue-200 hover:bg-blue-600/30"
          >
            JSON 表示
          </a>
        </div>
      </div>
    </div>
  );
}
