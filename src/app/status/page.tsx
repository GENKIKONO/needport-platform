import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail/smtp";

interface StatusCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  responseTime?: number;
}

async function checkDatabase(): Promise<StatusCheck> {
  const start = Date.now();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      return {
        name: 'Database',
        status: 'down',
        message: `Database error: ${error.message}`
      };
    }
    
    const responseTime = Date.now() - start;
    return {
      name: 'Database',
      status: 'healthy',
      message: 'Connected successfully',
      responseTime
    };
  } catch (error) {
    return {
      name: 'Database',
      status: 'down',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkStorage(): Promise<StatusCheck> {
  const start = Date.now();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return {
        name: 'Storage',
        status: 'down',
        message: `Storage error: ${error.message}`
      };
    }
    
    const responseTime = Date.now() - start;
    return {
      name: 'Storage',
      status: 'healthy',
      message: `${data.length} buckets available`,
      responseTime
    };
  } catch (error) {
    return {
      name: 'Storage',
      status: 'down',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkMail(): Promise<StatusCheck> {
  try {
    // Check if mail configuration exists
    const smtpHost = process.env.SMTP_HOST;
    const mailFrom = process.env.MAIL_FROM;
    
    if (!smtpHost || !mailFrom) {
      return {
        name: 'Mail',
        status: 'degraded',
        message: 'Mail configuration incomplete'
      };
    }
    
    return {
      name: 'Mail',
      status: 'healthy',
      message: 'Mail configuration present'
    };
  } catch (error) {
    return {
      name: 'Mail',
      status: 'down',
      message: `Mail check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkSystem(): Promise<StatusCheck> {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      name: 'System',
      status: 'healthy',
      message: `Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m, Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    };
  } catch (error) {
    return {
      name: 'System',
      status: 'degraded',
      message: 'System check failed'
    };
  }
}

export default async function StatusPage() {
  const checks = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkMail(),
    checkSystem()
  ]);

  const overallStatus = checks.every(check => check.status === 'healthy') 
    ? 'healthy' 
    : checks.some(check => check.status === 'down') 
      ? 'down' 
      : 'degraded';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NeedPort システム状況
          </h1>
          <p className="text-gray-600">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </p>
        </div>

        {/* Overall Status */}
        <div className={`mb-8 p-6 rounded-lg border ${getStatusColor(overallStatus)}`}>
          <div className="flex items-center justify-center">
            <span className="text-2xl mr-3">{getStatusIcon(overallStatus)}</span>
            <h2 className="text-xl font-semibold">
              システム状況: {overallStatus === 'healthy' ? '正常' : overallStatus === 'degraded' ? '一部障害' : '障害'}
            </h2>
          </div>
        </div>

        {/* Individual Checks */}
        <div className="grid gap-4 md:grid-cols-2">
          {checks.map((check) => (
            <div key={check.name} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">{check.name}</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(check.status)}`}>
                  {getStatusIcon(check.status)} {check.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{check.message}</p>
              {check.responseTime && (
                <p className="text-sm text-gray-500">
                  応答時間: {check.responseTime}ms
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">システム情報</h3>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p><strong>環境:</strong> {process.env.NODE_ENV || 'unknown'}</p>
              <p><strong>バージョン:</strong> {process.env.NEXT_PUBLIC_BUILD_SHA || 'unknown'}</p>
            </div>
            <div>
              <p><strong>タイムゾーン:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
              <p><strong>Node.js:</strong> {process.version}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            問題が発生している場合は、管理者にお問い合わせください。
          </p>
          <p className="mt-1">
            <a href="mailto:support@needport.jp" className="text-blue-600 hover:underline">
              support@needport.jp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
